from django.shortcuts import render
from djangoapps.utils import get_this_template
from econ.models import Cubes
from econ.oper import fetch_data as fd


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

    json_data = fd.getAllCubesList()

    # store into Cubes model
    status = 'SUCCESS'
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

    context = {
        'status': status
    }

    return render(request, 'pages/run_jobs.html', context)
