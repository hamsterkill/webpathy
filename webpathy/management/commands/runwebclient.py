from django.core.management.base import BaseCommand
from django.core.management import call_command
from webpathy.telutils import client  # Import your Telethon client
import asyncio

class Command(BaseCommand):
    help = 'Starts the server and handles cleanup on shutdown.'

    def handle(self, *args, **kwargs):
        try:
            # Start the server
            #asyncio.run(await client.start())

            call_command('runserver', *args, **kwargs)
        finally:
            # This block will run when the server is stopped
            self.stdout.write('Shutting down the server...')
            # Disconnect the Telethon client here
            if client.is_connected():
                self.stdout.write('Disconnecting the Telethon client...')
                asyncio.run(client.disconnect())
