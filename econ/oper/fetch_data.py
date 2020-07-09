# this script fetches data from the stats can api
import os
import requests
import json


# getAllCubesList
def getAllCubesList():

    # get request
    url = 'https://www150.statcan.gc.ca/t1/wds/rest/getAllCubesList'
    header = os.environ.get('STATS_CAN_API_KEY')
    x = requests.get(url, headers={'user-key': header})
    json_data = json.loads(x.text)

    # dump json to file
    with open('all_cubes_list.json', 'w') as outfile:
        json.dump(json_data, outfile, indent=4)

    # count product IDs
    pid = []
    for i, k in enumerate(json_data):
        pid.append(k['productId'])

    return len(pid)


print(getAllCubesList())
