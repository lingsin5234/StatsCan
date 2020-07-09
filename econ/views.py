from django.shortcuts import render
from djangoapps.utils import get_this_template


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
