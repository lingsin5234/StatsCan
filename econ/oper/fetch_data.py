# this script fetches data from the stats can api
import os
import requests
import json
import wget
import re
from zipfile import ZipFile


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

    '''
    # get product names
    names = []
    pid = []
    for i, k in enumerate(json_data):
        pid.append(k['productId'])
        names.append(k['cubeTitleEn'])
    names = sorted(names)

    # store into file
    with open('all_products.txt', 'w') as outfile:
        for n in names:
            outfile.write(n + '\n')
    '''

    return json_data


# getFullTableDownloadCSV
def getFullTableDownloadCSV(productId):

    # get request
    url = 'https://www150.statcan.gc.ca/t1/wds/rest/getFullTableDownloadCSV/' + str(productId) + '/en'
    header = os.environ.get('STATS_CAN_API_KEY')
    x = requests.get(url, headers={'user-key': header})
    json_data = json.loads(x.text)

    # get download URL link:
    download_url = json_data['object']
    print(download_url)
    file_name = re.sub(r'^.*/([A-Za-z0-9\.\-]+)$', '\\1', download_url)
    print(file_name)

    # download file:
    try:
        wget.download(download_url, 'econ/download/' + file_name)
        print('\n')
    except Exception as e:
        print('Download Failed:', str(e))
        return False
    else:
        print('Download Succeeded.')

    return True


# unzip file
def unzip_download(productId):

    file_name = str(productId) + '-eng.zip'
    file_path = 'econ/download/' + file_name
    try:
        with ZipFile(file_path, 'r') as zipObj:
            zipObj.extractall('econ/data')
    except Exception as e:
        print('Unzip Failed:', str(e))
        return False
    else:
        print('Unzip succeeded.')

    return True


getAllCubesList()
# unzip_download(16100017)
