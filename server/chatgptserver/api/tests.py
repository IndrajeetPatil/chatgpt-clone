from .views import get_azure_openai_response


def testget_azure_openai_response():
    response = get_azure_openai_response("What is the meaning of life?")
    assert response is not None
    assert isinstance(response, str)
    assert len(response) > 0
