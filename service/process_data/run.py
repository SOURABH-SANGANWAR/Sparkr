from .clean_models import get_cleaned_models
from .clean_serializers import get_cleaned_serializers
from .clean_routes import get_cleaned_routes

def clean_data(apps, tables, serializers, routes):
    # try:
        cleaned_models, deleted_models = get_cleaned_models(apps, tables)
        cleaned_serializers, deleted_serializers = get_cleaned_serializers(serializers, cleaned_models, apps)
        cleaned_routes, deleted_routes = get_cleaned_routes(cleaned_serializers, cleaned_models, apps, routes)
        return True, {
            "cleaned_models": cleaned_models,
            "cleaned_serializers": cleaned_serializers,
            "cleaned_routes": cleaned_routes,
            "deleted_models": deleted_models,
            "deleted_serializers": deleted_serializers,
            "deleted_routes": deleted_routes
        }
    # except Exception as e:
    #     return False, str(e)
