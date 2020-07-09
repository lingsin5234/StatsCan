# this script fetches data from the stats can api
import os
import requests


# getAllCubesList
def getAllCubesList():

    url = 'https://www150.statcan.gc.ca/t1/wds/rest/getAllCubesList'
    header = os.environ.get('STATS_CAN_API_KEY')
    x = requests.get(url, headers={'user-key': header})
    json_data = x.text

    return json_data


print(getAllCubesList())
