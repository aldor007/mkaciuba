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
    return Category.findOne({id})
  }

  @Mutation(() => Category)
  async createCategory(@Arg("data") data: CreateCategoryInput) {

    const category = Category.create(data)
    await category.save();
    return category;
  }

  @Mutation(() => Category)
  async deleteCategory(@Arg("id") id: string) {
    const category = await Category.delete(id)
    return category;
  }

  @Mutation(() => Category)
  async deleteCategories(@Arg("ids", () => [String])ids: string[]) {
    const category = await Category.delete(ids)
    return category;
  }
}
