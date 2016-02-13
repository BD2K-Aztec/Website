import json
from oauth2client.client import SignedJwtAssertionCredentials

# scope for the OAuth2 endpoint
SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'

# the location of the keyfile that has the keydata
KEY_FILEPATH = 'secret.json'

# load the key file's private data
with open(KEY_FILEPATH) as key_file:
	_key_data = json.load(key_file)

# make a credentials objects from the keydata and OAuth2 scope
_credentials = SignedJwtAssertionCredentials(
	_key_data['client_email'], _key_data['private_key'], SCOPE)

# defines a method to get an access token from the credentials object
# the access token is automatically refreshed if its expired
#def get_access_token();
	#return _credentials.get_access_token().access_token

print _credentials.get_access_token().access_token





