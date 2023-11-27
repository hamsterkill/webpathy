from asgiref.sync import sync_to_async
from django.shortcuts import render
from django.http import StreamingHttpResponse
import json, os, shutil, asyncio
from .tutils import api_id, api_hash, process_user_status
from telethon import functions, types, TelegramClient

async def main(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        lat = data['latitude']
        lng = data['longitude']
        
        #if not client.is_connected():
        client = TelegramClient('web', api_id, api_hash)

        await client.start()

        print('getting locations')
        result = await client(
            functions.contacts.GetLocatedRequest(
                geo_point=types.InputGeoPoint(
                    lat=float(lat),
                    long=float(lng),
                    accuracy_radius=42,
                )
            )
        )
        await client.disconnect()
        #print(result.stringify())

        if os.path.isdir('webpathy/static/pimgs'):
            shutil.rmtree('webpathy/static/pimgs')

        response_data=[]

        distances={}

        for peerloc in result.updates[0].peers:
            try:
                if hasattr(peerloc, "peer") and hasattr(peerloc, "distance"):
                    distances[peerloc.peer.user_id] = peerloc.distance
            except:
                #print('peer error')
                pass
        
        def stream_users():
            loop = asyncio.new_event_loop() 

            async def fetch_users():
                client = TelegramClient('web', api_id, api_hash)
                await client.start()
                for user in result.users:
                    obj = {}
                    obj['u_id'] = user.id
                    obj['dst'] = distances[user.id]
                    obj['f_name'] = user.first_name
                    obj['l_name'] = user.last_name
                    obj['username'] = user.username
                    obj['phone'] = user.phone
                    obj['a_hash'] = user.access_hash
                    status = process_user_status(user.status, types)
                    obj['status'] = status

                    async for photo in client.iter_profile_photos(user):
                        await client.download_media(photo, 'webpathy/static/pimgs/' + str(user.id))
                        break

                    #photo = await client.get_profile_photos(user)
                    #if len(photos) > 0:
                        #await client.download_media(photos[0], 'webpathy/static/pimgs/' + str(user.id))

                    yield json.dumps(obj) + "\n"
                await client.disconnect()

            async_gen = fetch_users()

            while True:
                try:
                    data = loop.run_until_complete(async_gen.__anext__())
                    yield data
                except StopAsyncIteration:
                    break

            loop.close()

        return StreamingHttpResponse(streaming_content=stream_users())

    else:
        response = await sync_to_async(render)(request, 'index.html')
        return response