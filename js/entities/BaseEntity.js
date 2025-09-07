export class BaseEntity {
    constructor(data) {
        this.id = data.id || this.generateUUID();
        this.name = data.name || 'Unknown';
        this.type = data.type || 'entity';
        this.x = data.x || 0;
        this.y = data.y || 0;
    }
}