from django.shortcuts import render
from djangoapps.utils import get_this_template
from rest_framework import views
from rest_framework.response import Response
import json
import re
import pandas as pd
from econ.models import Cubes
from econ.oper import fetch_data as fd
from econ.serializers import CubeSerializer
from econ.oper import shape_data as sd


# project page
def project_markdown(request):

    page_height = 1050
    f = open('econ/README.md', 'r')
    if f.mode == 'r':
        readme = f.read()
        page_height = len(readme)/2 + 200

    content = {
        'readme': readme,
        'page_height': page_height
    }

    template_page = get_this_template('econ', 'project.html')

    return render(request, template_page, content)


# run a oper job
def run_oper(request):

    # json_data = fd.getAllCubesList()

    # store into Cubes model
    status = 'SUCCESS'
    '''
    for i, k in enumerate(json_data):
        try:
            newDict = {
                'productId': k['productId'],
                'cansimId': k['cansimId'],
                'cubeTitleEn': k['cubeTitleEn'],
                'frequencyCode': k['frequencyCode']
            }
            y = Cubes(**newDict)
            y.save()
        except Exception as e:
            print(k['productId'], e)
            status = 'FAILED'
            break
    '''
    context = {
        'status': status
    }

    return render(request, 'pages/run_jobs.html', context)


# list Cubes
class CubesAPI(views.APIView):

    # get request
    def get(self, request):

        # if there is a keyword in the request, isolate queryset for only those objects
        if 'keyword' in request.GET:
            # get Cubes with keyword
            queryset = Cubes.objects.filter(cubeTitleEn__contains=str(request.GET['keyword'])).values()
        else:
            # get Cubes
            queryset = Cubes.objects.values()
        data_output = CubeSerializer(queryset, many=True).data

        # get list of product names
        names = []
        pid = []
        for k in data_output:
            names.append(k['cubeTitleEn'])
            pid.append(k['productId'])

        context = {
            'product_nm': names,
            'product_id': pid
        }

        return render(request, 'partials/list_cubes.html', context)
        # return Response(data_output)


def listCubes(request):

    context = {

    }

    return render(request, 'pages/listCubes.html', context)


def plotMilkProducts(request):

    # get df and convert date column to YYYY-MM-DD (use first day)
    df = sd.shapeProduct(32100111)
    # df['REF_DATE'] = df['REF_DATE'] + '-01'
    df['REF_DATE'] = pd.to_datetime(df['REF_DATE'] + '-01', format='%Y-%m-%d', errors='coerce')
    df.rename(columns={'REF_DATE': 'date'}, inplace=True)
    # print(df)

    # convert value of measurement, then drop SCALAR_ID and VALUE
    df['value'] = 10**df['SCALAR_ID'] * df['VALUE']
    df.drop(['SCALAR_ID', 'VALUE'], axis=1, inplace=True)

    # commodities
    commodities = list(df['Commodity'].unique())

    # reshape this table to list date vs province totals
    reshape_df = {}
    for c in commodities:
        new_df = df[(df['Commodity'] == c) & (df['GEO'] != 'Canada')].copy()
        new_df = new_df.pivot(index='date', columns='GEO', values='value', )
        new_df.fillna(0, inplace=True)
        new_df.reset_index(inplace=True)
        # print(new_df.head())

        # add UOM column
        new_df['UOM'] = list(df.loc[df['Commodity'] == c, 'UOM'])[0]

        # write to json
        reshape_df[c] = new_df.to_json(orient='records', date_format='epoch')

    # GEOs
    geo = list(df['GEO'].unique())
    geo = [g for g in geo if g != 'Canada']

    context = {
        'data': reshape_df,
        'commodities': commodities,
        'geo': geo
    }

    return render(request, 'pages/plot_milk_products.html', context)


def plotGHGEmissions(request):

    # get df and convert date column to YYYY-MM-DD (use first day)
    list = [38100097, 38100111]
    frames = []
    for l in list:
        temp = sd.shapeProduct(l)
        temp.rename(columns={'REF_DATE': 'date'}, inplace=True)

        # only grab necessary columns
        temp = temp[['date', 'GEO', 'Sector', 'UOM', 'SCALAR_ID', 'VALUE']]
        frames.append(temp)
    df = pd.concat(frames)

    # convert value of measurement, then drop SCALAR_ID and VALUE
    df['value'] = 10**df['SCALAR_ID'] * df['VALUE']
    df.drop(['SCALAR_ID', 'VALUE'], axis=1, inplace=True)
    # print('CONCAT:', df.head())

    # GEOs
    geo = df['GEO'].unique()
    geo = [g for g in geo]
    # print('GEO:', geo)

    # Sectors
    sector = df['Sector'].unique()
    sector = [s for s in sector]

    # reshape this table to list date vs province totals
    new_df = pd.pivot_table(df, values='value', index=['date', 'Sector', 'UOM'], columns='GEO')
    # print('PIVOT TABLE:', new_df)

    # reset index to put the 3 index back to columns, replace NAs
    new_df.reset_index(inplace=True)
    new_df.fillna(0, inplace=True)
    # print('RESET:', new_df.head())

    # calculate GRAND TOTAL of all sectors by YEAR + GEO
    totals_df = new_df.groupby(['date', 'UOM'])[geo].apply(lambda x: x.astype(int).sum())
    totals_df['Sector'] = 'GRAND TOTAL'
    totals_df.reset_index(inplace=True)
    # print('AGGREGATE:', totals_df.head())

    # concat back to the new_df and sort by year and sector again
    new_df = pd.concat([new_df, totals_df])
    new_df = new_df.sort_values(by=['date', 'Sector'])
    print('With Grand Total:', new_df.head())

    # write to json
    reshape_df = new_df.to_json(orient='records')
    # print('RESHAPE:', reshape_df)

    # debug Sector -- unexpected String?
    # print([s for s in sector if re.search("\'", s)])
    # print(type(sector))
    # print(type(geo))

    context = {
        'data': reshape_df,
        'geo': geo,
        'sector': json.dumps(sector)
    }

    return render(request, 'pages/plot_ghg_emissions.html', context)
