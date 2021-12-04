import os, discord, discord.utils
import discord.errors
from discord import FFmpegPCMAudio
from youtube_dl import YoutubeDL
from youtube_dl.utils import ExtractorError
from discord.voice_client import VoiceClient
from dotenv import load_dotenv
from discord.ext import commands
from discord.utils import get

load_dotenv() # loads .env for environment variables

TOKEN = os.getenv('DISCORD_TOKEN') # gets DISCORD_TOKEN from .env
GUILD = os.getenv('DISCORD_GUILD') # gets DISCORD_GUILD from .env
ADMIN = os.getenv('ADMIN_ID')

client = discord.Client() # Client() handles events, tracks state, interacts with Discord APIs
bot = commands.Bot( command_prefix = '-' , strip_after_prefix = 'True') # Bot() behaves similarly

@bot.event
async def on_ready(): # event handler, handles the event when the Bot has established a connection to Discord
    
    for guild in bot.guilds:
        if guild.name == GUILD:
            break
    
    print(
        f'{bot.user} has connected to the following guild: \n'
        f'{guild.name} (id: {guild.id})'
    )

@bot.command( name = 'kill' , help = 'Kills Bigweld.' )
async def kill_bot(context):
    print(f'\tcommand: {context.message.content}, context: {context.author.name} ({context.author.id}) in {context.channel.name} ({context.channel.id})')
    if str(context.author.id) == ADMIN:
        await leave_voice(context)
        await context.send('Oh noooo please don\'t kill me oh n')
        await bot.logout()
        await bot.close()
        print("\tBot terminated")
    else:
        print(f'{context.author} (id: {context.author.id}) attempted to terminate Bigweld.')
        await context.send(f'{context.author.name} is a meanie 😡')

@bot.command( name = 'raise' , help = 'Raises discord.DiscordException' )
async def raise_exception(context):
    print(f'\tcommand: {context.message.content}, context: {context.author.name} ({context.author.id}) in {context.channel.name} ({context.channel.id})')
    if str(context.author.id) == ADMIN:
        await context.send('Exception raised!')
        raise discord.DiscordException
    else:
        print(f'{context.author} (id: {context.author.id}) attempted to terminate Bigweld.')
        await context.send(f'{context.author.name} is a meanie 😡')

@bot.command( name = 'join' , help = 'Bigweld will grace you with his presence.')
async def join_voice(context):
    print(f'\tcommand: {context.message.content}, context: {context.author.name} ({context.author.id}) in {context.channel.name} ({context.channel.id})')
    invoker_voice_state = context.author.voice
    if invoker_voice_state == None:
        await context.send(f'You must join a voice channel before summoning me!')
    else:
        try:
            voice_client = await invoker_voice_state.channel.connect()
            await context.send(f'See a need, fill a need!')
        except discord.ClientException:
            if invoker_voice_state.channel in [client.channel for client in bot.voice_clients]:
                await context.send(f'I\'m already here!')
            else:
                await bot.voice_clients[0].move_to(invoker_voice_state.channel)
                await context.send(f'Moving to "{invoker_voice_state.channel}"')
    return voice_client

@bot.command( name = 'leave' , help = 'Bigweld will fade into the darkness.')
async def leave_voice(context):
    print(f'\tcommand: {context.message.content}, context: {context.author.name} ({context.author.id}) in {context.channel.name} ({context.channel.id})')
    voice = get(bot.voice_clients, guild = context.guild)
    if voice != None:
        await context.send("Bye bye! 👋🤖")
        await voice.disconnect()
        voice.cleanup()

@bot.command( name = "play" , aliases = ["p"] , help = "Plays audio from a YouTube URL" )
async def play(context, *, arg):
    try:
        print(f'\tcommand: {context.message.content}, context: {context.author.name} ({context.author.id}) in {context.channel.name} ({context.channel.id})')
        YDL_OPTIONS = {'format' : 'bestaudio', 'noplaylist': 'true' , 'age_limit': 21 , 'default_search' : 'auto'}
        FFMPEG_OPTIONS = {'before_options': '-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5', 'options': '-vn'}

        voice = get(bot.voice_clients, guild = context.guild)

        if voice == None:
            voice = await join_voice(context)
            print(voice)

        if not voice.is_playing():
            with YoutubeDL(YDL_OPTIONS) as ydl:

                try:
                    get(arg)
                    video = ydl.extract_info(arg, download = False)['entries'][0]
                except:
                    video = ydl.extract_info(arg, download = False)
                URL = video['url']

                await voice.play(FFmpegPCMAudio(URL, **FFMPEG_OPTIONS))
                voice.is_playing()
                await context.send(f'Now playing: "{video["title"]}"\nurl: {video["webpage_url"]}')

        else:
            await context.send("Already playing a song (will make queues a thing soon)")
            return
    except commands.errors.MissingRequiredArgument:
        await context.send("Play what... ?")

@bot.command( name = "stop" , help = "Stops audio playback")
async def stop(context):
    print(f'\tcommand: {context.message.content}, context: {context.author.name} ({context.author.id}) in {context.channel.name} ({context.channel.id})')
    voice = get(bot.voice_clients, guild = context.guild)
    if not voice.is_playing():
        await context.send("There is nothing to be stopped")
    else:
        try:
            voice.stop()
            await context.send("Audio playback stopped")
        except:
            await context.send("An error occurred")

@bot.command( name = "pause" , help = "Pauses audio playback")
async def pause(context):
    print(f'\tcommand: {context.message.content}, context: {context.author.name} ({context.author.id}) in {context.channel.name} ({context.channel.id})')
    voice = get(bot.voice_clients, guild = context.guild)
    if voice.is_paused():
        await context.send("Already paused! Did you mean -resume?")
    else:
        await voice.pause()

@bot.command( name = "resume" , help = "Resumes audio playback")
async def resume(context):
    print(f'\tcommand: {context.message.content}, context: {context.author.name} ({context.author.id}) in {context.channel.name} ({context.channel.id})')
    voice = get(bot.voice_clients, guild = context.guild)
    if not voice.is_paused():
        await context.send("Already resumed! Did you mean -pause?")
    else:
        await voice.resume()

@bot.event
async def on_error(event, *args, **kwargs):
    with open('err.log', 'a', encoding = "UTF-8") as f:
        if event == 'on_message':
            f.write(f'Unhandled message: {args[0]}\n')
        else:
            raise

bot.run(TOKEN) # runs Bot using our token