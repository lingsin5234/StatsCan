# this script contains functions to shape the data from csv
import pandas as pd
import re


def shapeProduct(productId):

    # read CSV
    file_name = str(productId) + '.csv'
    file_path = 'econ/data/' + file_name
    full_df = pd.read_csv(file_path)

    # let's explore the grand total first
    '''
    # for lumber production
    product = 'Total softwood and hardwood, production'
    df = full_df[full_df['North American Product Classification System (NAPCS)'] == product]
    '''
    # exploring farm livestock
    if 'Commodity' in full_df.columns:
        # check if there is a "Total"
        df = full_df[full_df.Commodity.str.startswith('Total')]
        if len(df) > 0:
            # print(productId)
            # print(df.head())
            pass
            # ignore this one for now.
        else:
            # print(full_df.head())
            df = full_df[full_df.REF_DATE.str.startswith('20')]

            # unclear if all files are structured this way
            columns = ['REF_DATE', 'GEO', 'Commodity', 'SCALAR_ID', 'VALUE', 'UOM']
            df = df[columns]
            df.fillna(0, inplace=True)
            # print(df)
    # exploring berries/fruits/veggies
    elif bool('Type of fruit' in full_df.columns) & bool('Production and value' in full_df.columns):
        # isolate for fruits, estimates, type of process
        df = full_df.rename(
            columns={
                'Production and value': 'Production',
                'Type of fruit': 'Fruit',
                'Estimates': 'Estimate',
                'Type of process': 'Process'
            })
        # isolate production totals only
        df = df[df.Production.str.contains('Total') & df.Production.str.contains('production')]

    # exploring GHG emissions
    elif bool('Sector' in full_df.columns):
        '''
        Balancing items

        A balancing item is, in the case of transaction flows, the difference between 
        the sum of one set of market transactions and that of another set of transactions, 
        or in the case of stocks, the difference between one aggregate of stocks and another. 
        A balancing item is an accounting construct and is not, in itself, 
        an observable transaction or stock, although it is derived from transactions or stocks. 
        Some examples of balancing items are gross value added, gross saving and net worth.
        '''

        # if year is before 2009, then just take it as is
        if full_df['REF_DATE'][0] < 2009:
            df = full_df
        else:
            df = full_df[full_df['GEO'] != 'Canada'].copy()

        # print(df)

    return df


# shapeProduct(16100017)
'''
# list = [32100111, 32100112, 32100113, 32100117]
# list = [32100264, 32100266, 32100267]  # 32100263 fresh corn; different format
list = [38100097, 38100111]
for l in list:
    shapeProduct(l)
'''
