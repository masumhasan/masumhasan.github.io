import requests

node_url = 'https://nodes-testnet.wavesnodes.com'
address = '3MurLWGHZZDxmEtRqfJhXTCLnSsD9qyR8JZ'

account_data_storage_data = requests.get(f'{node_url}/addresses/data/{address}').json()
print(account_data_storage_data)