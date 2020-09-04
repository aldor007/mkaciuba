import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import { CategoryHasMedia } from './CategoryHasMedia'
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class Media extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  url: string;

  @Field()
  @Column()
  enabled: boolean;

  @Field()
  @Column()
  description: string;

  @OneToMany('CategoryHasMedia','category')
  categories: Promise<CategoryHasMedia[]>

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date
}
