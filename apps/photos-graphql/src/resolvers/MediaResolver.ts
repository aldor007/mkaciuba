import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { Media } from '../models/Media';
import { CreateMediaInput } from '../inputs/CreateMediaInput';

@Resolver(Media)
export class MediaResolver {

  @Query(returns => [Media])
  medias() {
    return Media.find()
  }

  @Query(returns => Media)
  category(@Arg('id') id: string) {
    return Media.findOne({id})
  }

  // @Mutation(() => Media)
  // async createMedia(@Arg("data") data: CreateMediaInput) {

  //   const media = Media.create(data)
  //   await media.save();
  //   return media;
  // }

  @Mutation(() => Media)
  async deleteMedia(@Arg("id") id: string) {
    const category = await Media.delete(id)
    return category;
  }

  @Mutation(() => Media)
  async deleteMedias(@Arg("ids", () => [String])ids: string[]) {
    const category = await Media.delete(ids)
    return category;
  }
}
