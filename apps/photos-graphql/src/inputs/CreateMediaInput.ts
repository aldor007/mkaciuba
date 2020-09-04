import { InputType, Field } from "type-graphql";

@InputType()
export class CreateMediaInput {
  @Field()
  name: string;

  @Field({nullable: true})
  enabled?: boolean;

  @Field()
  description: string;

  @Field({nullable: true})
  url: string;

  @Field(type => [String], { nullable: true})
  categories?: string[];

}
