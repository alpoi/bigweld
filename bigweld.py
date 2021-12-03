import os, discord, discord.utils
import discord.errors
from discord.voice_client import VoiceClient
from dotenv import load_dotenv
from discord.ext import commands

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

@bot.command( name = 'exit' , help = 'Kills Bigweld.' )
async def kill_bot(context):
    print(f'command: {context.message}, context: {context.author.name} ({context.author.id}) in {context.channel.name} ({context.channel.id})')
    if str(context.author.id) == ADMIN:
        await context.send('Bye bye! 👋🤖')
        await bot.close()
        print("Bot terminated")
    else:
        print(f'{context.author} (id: {context.author.id}) attempted to terminate Bigweld.')
        await context.send(f'{context.author.name} is a meanie 😡')

@bot.command( name = 'raise' , help = 'Raises discord.DiscordException' )
async def raise_exception(context):
    print(f'command: {context.message}, context: {context.author.name} ({context.author.id}) in {context.channel.name} ({context.channel.id})')
    if str(context.author.id) == ADMIN:
        await context.send('Exception raised!')
        raise discord.DiscordException
    else:
        print(f'{context.author} (id: {context.author.id}) attempted to terminate Bigweld.')
        await context.send(f'{context.author.name} is a meanie 😡')

@bot.command( name = 'join' , help = 'Bigweld will grace you with his presence.')
async def join_voice(context):
    print(f'command: {context.message}, context: {context.author.name} ({context.author.id}) in {context.channel.name} ({context.channel.id})')
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

@bot.event
async def on_error(event, *args, **kwargs):
    with open('err.log', 'a', encoding = "UTF-8") as f:
        if event == 'on_message':
            f.write(f'Unhandled message: {args[0]}\n')
        else:
            raise

bot.run(TOKEN) # runs Bot using our token