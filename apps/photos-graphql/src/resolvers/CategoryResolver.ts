import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { Category } from '../models/Category';
import { CreateCategoryInput } from '../inputs/CreateCategoryInput';

@Resolver(Category)
export class CategoryResolver {
  @Query(() => String)
  hello() {
    return "world";
  }

  @Query(returns => [Category])
  categories() {
    return Category.find()
  }

  @Query(returns => Category)
  category(@Arg('id') id: string) {
    return Category.find({id})
  }

  @Mutation(() => Category)
  async createCategory(@Arg("data") data: CreateCategoryInput) {

    const category = Category.create(data)
    await category.save();
    return category;
  }
}
