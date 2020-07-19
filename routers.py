from django.conf import settings


class STATSCANRouter:
    """
    A router to control all database operations
    on models in the statscan app
    """

    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'statscan':
            return 'statscan_db'
        return None

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'statscan':
            return 'statscan_db'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        # Allow relations if a model is in the statscan
        if obj1._meta.app_label == 'statscan' or obj2._meta.app_label == 'statscan':
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == 'statscan' and db == 'statscan_db':
            # this catches statscan for statscan_db ONLY
            return db == 'statscan_db'
        elif app_label == 'statscan' or db == 'statscan_db':
            # this catches all that should not be in statscan_db
            # and for statscan to not be added to default db
            return False
        # allows other apps to go to default database
        return None
