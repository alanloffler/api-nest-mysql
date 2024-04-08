import { EntitySubscriberInterface, EventSubscriber, UpdateEvent } from 'typeorm';
import { Category } from './entities/category.entity';

@EventSubscriber()
export class CategorySubscriber implements EntitySubscriberInterface<Category> {
    listenTo() {
        return Category;
    }

    
    // async beforeSoftRemove(event: SoftRemoveEvent<Category>) {

    //    await event.connection.getRepository(Category).update(event.entity.id, { updatedBy: 1 });
    //     //await event.manager.update(Category, event.entity.id, { updatedBy: 1 });
    //     console.log(event.entity);
    //     // await event.manager.update(Category, event.entity.id, { updatedBy: 100});
    //     // event.entity.updatedBy = 100;
    //     //event.entity.password = hashedPassword;
    // }

    
    async beforeUpdate(event: UpdateEvent<Category>) {
        console.log('Action before update', event.entity);
    }
}
