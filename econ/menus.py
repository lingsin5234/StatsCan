from menu import Menu, MenuItem
from django.urls import reverse
from . import views as econ_vw


# add items to the menu
Menu.add_item("econ", MenuItem("My Portfolio", url="/", weight=10))
Menu.add_item("econ", MenuItem("Econ Project", reverse(econ_vw.project_markdown), weight=10))
