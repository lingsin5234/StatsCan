from django.conf import settings


class ECONRouter:
    """
    A router to control all database operations
    on models in the econ app
    """

    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'econ':
            return 'econ_db'
        return None

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'econ':
            return 'econ_db'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        # Allow relations if a model is in the econ
        if obj1._meta.app_label == 'econ' or obj2._meta.app_label == 'econ':
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == 'econ' and db == 'econ_db':
            # this catches econ for econ_db ONLY
            return db == 'econ_db'
        elif app_label == 'econ' or db == 'econ_db':
            # this catches all that should not be in econ_db
            # and for econ to not be added to default db
            return False
        # allows other apps to go to default database
        return None
