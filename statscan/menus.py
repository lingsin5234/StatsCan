from menu import Menu, MenuItem
from django.urls import reverse
from . import views as statscan_vw


# add items to the menu
Menu.add_item("statscan", MenuItem("My Portfolio", url="/", weight=10))
Menu.add_item("statscan", MenuItem("Stats Can Project", reverse(statscan_vw.project_markdown), weight=10))
Menu.add_item("statscan", MenuItem("GHG Emissions Chart", reverse(statscan_vw.plotGHGEmissions), weight=10))
