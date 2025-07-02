import graphene
from graphql.error import GraphQLError 
from app.services import convert_image_to_svg

class SVGConversionResult(graphene.ObjectType):
    id = graphene.ID()
    svg_code = graphene.String()

class UploadImage(graphene.Mutation):
    class Arguments:
        image_data = graphene.String(required=True)

    Output = SVGConversionResult

    def mutate(self, info, image_data):
        """
        Handles the image upload and SVG conversion.
        Calls the convert_image_to_svg function from services.py.
        """
        try:
            svg_code = convert_image_to_svg(image_data)
            mock_id = "some-mock-uuid-12345" 

            return SVGConversionResult(id=mock_id, svg_code=svg_code)

        except ValueError as e:
            print(f"GraphQL Error (ValueError): {e}")
            raise GraphQLError(f"Invalid input: {e}")
        except RuntimeError as e:
            print(f"GraphQL Error (RuntimeError): {e}")
            raise GraphQLError(f"Backend processing error: {e}. Please check server logs for details.")
        except Exception as e:
            print(f"GraphQL Unexpected Error: {e}")
            raise GraphQLError(f"An unexpected error occurred during SVG conversion: {e}")

class Query(graphene.ObjectType):
    svg_result = graphene.Field(SVGConversionResult, id=graphene.ID(required=True))

    def resolve_svg_result(self, info, id):
        if id == "some-mock-uuid-12345":
            return SVGConversionResult(id="some-mock-uuid-12345", svg_code="<svg>...</svg>")
        return None

class Mutation(graphene.ObjectType):
    upload_image = UploadImage.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
