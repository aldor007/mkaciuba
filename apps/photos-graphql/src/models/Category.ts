import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, UpdateDateColumn,CreateDateColumn, JoinTable } from "typeorm";
import { CategoryHasMedia } from './CategoryHasMedia'
import { ObjectType, Field } from 'type-graphql'
import { Media } from './Media';

@ObjectType()
@Entity()
export class Category extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ default: false })
  public: boolean;

  @Field()
  @Column()
  publicationDate: Date;

  @Field()
  @JoinTable()
  @OneToMany('Media','image', {
    nullable: true
  })
  image?: Media;

  @Field()
  @JoinTable()
  @OneToMany('Media','file', {
    nullable: true
  })
  file?: Media

  @OneToMany(() => CategoryHasMedia, chm => chm.media)
  medias: Promise<CategoryHasMedia[]>

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
