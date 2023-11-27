# webpathy
Simple OSINT web framework to locate users using telegram api. 
## installation
Clone, set up venv, install requirements, run server.
```bash
git clone https://github.com/hamsterkill/webpathy.git
python3 -m venv webpathy
source webpathy/bin/activate
pip3 install -r requirements.txt
```
### userconfig
In the webpathy/tutils.py modify your api_id and api_hash.
```python
api_id = 'your_api_id'
api_hash = 'your_api_hash'
```
### runserver
Activate the venv then start server.
```bash
source webpathy/bin/activate
python manage.py runserver
```
Then login into your account and start workin!

### usage
dbclick on map then try to find smth. glhf!
