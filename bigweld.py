import asyncio, functools, itertools, discord, youtube_dl, random, math, os
from async_timeout import timeout
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.environ.get('DISCORD_TOKEN')
GUILD = os.environ.get('DISCORD_GUILD')
ADMIN = os.environ.get('ADMIN_ID')

class SearchError(Exception):
    pass

class AudioSource(discord.PCMVolumeTransformer):

    YDL_OPTIONS = {
        'format': 'bestaudio',
        'nocheckcertificate' : True,
        'noplaylist' : True,
        'quiet' : True,
        'no_warnings' : True,
        'age_limit' : 21,
        'default_search' : 'auto'
    }

    FFMPEG_OPTIONS = {
        'before_options': '-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5',
        'options': '-vn',
    }

    ydl = youtube_dl.YoutubeDL(YDL_OPTIONS)

    def __init__(self, context: commands.Context, source: discord.FFmpegPCMAudio, * , data: dict, volume: float = 1):

        super().__init__(source, volume)

        self.requester = context.author
        self.channel = context.channel
        self.data = data # acquired by ydl.extract_info
        self.title = data.get('title')
        self.thumbnail = data.get('thumbnail')
        self.duration = self.parse_duration(int(data.get('duration')))
        self.url = data.get('webpage_url')
        self.stream_url = data.get('url')

    def __str__(self):
        return f'**{self.title}** requested by **{self.requester}**'

    @classmethod
    async def create_source(cls, context: commands.Context, search: str, * , loop: asyncio.BaseEventLoop = None):
        # cls is used instead of self since this is a class method rather than an instance method
        loop = loop or asyncio.get_event_loop()
        # https://docs.python.org/3/library/asyncio-eventloop.html
        partial = functools.partial(cls.ydl.extract_info, search, download = False, process = False)
        # https://docs.python.org/3/library/functools.html#functools.partial
        data = await loop.run_in_executor(None, partial)
        # https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor

        if data is None: # Happens when extractions fails with an error
            raise SearchError(f'Nothing found for "{search}"')

        if 'entries' not in data: # Only one entry returned (URL used)
            process_info = data
        else:
            process_info = None # Prepare for no valid entries
            for entry in data['entries']:
                if entry:
                    process_info = entry
                    break
            
            if process_info is None:
                raise SearchError(f'Nothing found for "{search}"')

        webpage_url = process_info['webpage_url']
        partial = functools.partial(cls.ydl.extract_info, webpage_url, download = False)
        processed_info = await loop.run_in_executor(None, partial)

        if processed_info is None:
            raise SearchError(f'Couldn\'t fetch `{webpage_url}`')

        if 'entries' not in processed_info:
            info = processed_info
        else:
            info = None
            while info is None:
                try:
                    info = processed_info['entries'].pop(0)
                except IndexError: # entries is empty
                    raise SearchError(f'Nothing found for `{webpage_url}`')
        
        return cls(context, discord.FFmpegPCMAudio(info['url'], **cls.FFMPEG_OPTIONS), data = info)

    @staticmethod
    def parse_duration(duration: int):
        mins, secs = divmod(duration, 60)
        hours, mins = divmod(mins, 60)
        days, hours = divmod(hours, 24)

        duration = []
        if days > 0:
            duration.append(f'{days} days')
        if hours > 0:
            duration.append(f'{hours} hours')
        if mins > 0:
            duration.append(f'{mins} minutes')
        if secs > 0:
            duration.append(f'{secs} seconds')

        return ', '.join(duration)

class Song:
    __slots__ = ('source', 'requester')

    def __init__(self, source: AudioSource):
        self.source = source
        self.requester = source.requester

    def create_embed(self):
        embed = (discord.Embed( title = 'Now playing',
                                description = f'[{self.source.title}]({self.source.url})',
                                colour = discord.Colour.dark_gold())
                .add_field(name = 'Duration', value = self.source.duration)
                .add_field(name = 'Requested by', value = self.requester.mention)
                .set_thumbnail(url = self.source.thumbnail)
                .set_author(name = self.requester.display_name, icon_url = self.requester.avatar_url))

        return embed

class SongQueue(asyncio.Queue):
    def __getitem__(self, item):
        if isinstance(item, slice):
            return list(itertools.islice(self._queue, item.start, item.stop, item.step))
        else:
            return self._queue[item]
    
    def __iter__(self):
        return self._queue.__iter__()

    def __len__(self):
        return self.qsize()

    def clear(self):
        self._queue.clear()

    def shuffle(self):
        random.shuffle(self._queue)
    
    def remove(self, index: int):
        del self._queue[index]

class VoiceState:
    def __init__(self, bot: commands.Bot, context: commands.Context):
        self.bot = bot
        self._context = context
        self.current = None
        self.voice = None
        self.exists = True
        self.next = asyncio.Event()
        self.songs = SongQueue()
        self._loop = False
        self._volume = 1
        self.skip_votes = set()
        self.audio_player = bot.loop.create_task(self.audio_player_task())

    def __del__(self):
        self.audio_player.cancel()

    @property
    def loop(self):
        return self._loop
    
    @loop.setter
    def loop(self, value: bool):
        self._loop = value

    @property
    def volume(self):
        return self._volume

    @volume.setter
    def volume(self, value: float):
        self._volume = value

    @property
    def is_playing(self):
        return self.voice and self.current
    
    async def audio_player_task(self):
        while True:
            self.next.clear()

            if not self.loop:
                try:
                    async with timeout(60): # 1 minute timeout if no songs are queued
                        self.current = await self.songs.get()
                except asyncio.TimeoutError:
                    await self.context.send('Adios bitches')
                    self.bot.loop.create_task(self.stop())
                    self.exists = False
                    return

            self.current.source.volume = self._volume
            self.voice.play(self.current.source, after = self.play_next_song)
            await self.current.source.channel.send(embed = self.current.create_embed())
            await self.next.wait()

    def play_next_song(self, error = None):
        if error:
            raise Exception(str(error))

        self.next.set()

    def skip(self):
        self.skip_votes.clear()

        if self.is_playing:
            self.voice.stop()

    async def stop(self):
        self.songs.clear()

        if self.voice:
            await self.voice.disconnect()
            self.voice = None

class Music(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.voice_states = {}

    def get_voice_state(self, context: commands.Context):
        state = self.voice_states.get(context.guild.id)
        if not state or not state.exists:
            state = VoiceState(self.bot, context)
            self.voice_states[context.guild.id] = state
        return state

    def cog_unload(self):
        for state in self.voice_states.values():
            self.bot.loop.create_task(state.stop())

    def cog_check(self, context: commands.Context):
        if not context.guild:
            raise commands.NoPrivateMessage('This command can\'t be used in DM channels.')
        return True

    async def cog_before_invoke(self, context: commands.Context):
        context.voice_state = self.get_voice_state(context)

    async def cog_command_error(self, context: commands.Context, error: commands.CommandError):
        await context.send(f'Error: {str(error)}')

    @commands.command(name = 'join')
    async def _join(self, context: commands.Context):
        if context.voice_state.voice:
            await context.voice_state.voice.move_to(context.author.voice.channel)
            await context.send(f'Moving to "{context.author.voice.channel}"')
            return
        
        context.voice_state.voice = await context.author.voice.channel.connect()
        await context.send(f'See a need, fill a need!')

    @commands.command(name = 'leave', aliases = ['disconnect, fuckoff'])
    async def _leave(self, context: commands.Context):
        if not context.voice_state.voice: # if not connected, do nothing
            return 

        await context.voice_state.stop()
        del self.voice_states[context.guild.id] # clear queue

    @commands.command(name = 'np', alises = ['nowplaying', 'playing'])
    async def _np(self, context = commands.Context):
        await context.send(embed = context.voice_state.current.create_embed())

    @commands.command(name = 'pause')
    async def _pause(self, context: commands.Context):
        if not context.voice_state.is_playing and context.voice_state.voice.is_playing():
            context.voice_state.voice.pause()
            await context.send('Audio playback has been paused.')

    @commands.command(name = 'resume')
    async def _resume(self, context: commands.Context):
        if not context.voice_state.is_playing and context.voice_state.voice.is_paused():
            context.voice_state.voice.resume()
            await context.send('Audio playback has been resumed.')

    @commands.command(name = 'stop')
    async def _stop(self, context: commands.Context):

        context.voice_state.songs.clear()

        if context.voice_state.is_playing:
            context.voice_state.voice.stop()
            await context.send('Audio playback has been stopped, and the queue has been cleared.')

    @commands.command(name = 'skip', aliases = ['s', 'forceskip', 'fs'])
    async def _skip(self, context: commands.Context):
        if not context.voice_state.is_playing:
            return # do nothing
        await context.send(f'Skipping "{context.voice_state.current.source.title}".')
        context.voice_state.skip()

    @commands.command(name = 'queue', aliases = ['q', 'que'])
    async def _queue(self, context: commands.Context, *, page: int = 1):
        if len(context.voice_state.songs) == 0:
            return await context.send("The silence is deafening...")

        items_per_page = 10
        pages = math.ceil(len(context.voice_state.songs) / items_per_page)

        start = (page - 1) * items_per_page
        end = start + items_per_page

        queue = ''

        for i, song in enumerate(context.voice_state.songs[start:end], start = start):
            queue += f'({i+1})\t[**{song.source.title}**]({song.source.url})\n'

        embed = discord.Embed(description = f'Queue consists of **{len(context.voice_state.songs)}** song(s): \n\n{queue}').set_footer(text = f'Page {page}/{pages}')
        await context.send(embed = embed)

    @commands.command(name = 'shuffle', aliases = ['sh'])
    async def _shuffle(self, context: commands.Context):
        if len(context.voice_state.songs) == 0:
            return

        context.voice_state.songs.shuffle()
        await context.send("Queue has been shuffled!")

    @commands.command(name = 'remove', aliases = ['rem', 'r', 'del', 'delete'])
    async def _remove(self, context: commands.Context, index: int):
        if len(context.voice_state.songs) == 0:
            return
        
        await context.send(f"Removed {context.voice_state.songs[index - 1].source.title} from the queue.")
        context.voice_state.songs.remove(index - 1)

    @commands.command(name = 'play', aliases = ['p'])
    async def _play(self, context: commands.Context, *, search: str):
        if not context.voice_state.voice:
            await context.invoke(self._join)

        async with context.typing():
            try:
                source = await AudioSource.create_source(context, search, loop = self.bot.loop)
            except SearchError as e:
                await context.send(f'Error: {str(e)}')
            else:
                song = Song(source)

                await context.voice_state.songs.put(song)
                await context.send(f'Added {str(source)} to queue.')

    @_join.before_invoke
    @_play.before_invoke
    async def ensure_voice_state(self, context: commands.Context):
        if not context.author.voice or not context.author.voice.channel:
            await context.send('You must join a voice channel before summoning me!')
            raise commands.CommandError('You are not connected to any voice channel.')

        if context.voice_client:
            if context.voice_client.channel != context.author.voice.channel:
                raise commands.CommandError('Bot is already in a voice channel.')
        
    
bot = commands.Bot( command_prefix = '-', strip_after_prefix = 'True')
bot.add_cog(Music(bot))

@bot.event
async def on_ready():
    for guild in bot.guilds:
        if guild.name == GUILD:
            break
    
    print(
        f'\t{bot.user} has connected to the following guild: \n'
        f'\t{guild.name} (id: {guild.id})'
    )
        
bot.run(TOKEN)

    

