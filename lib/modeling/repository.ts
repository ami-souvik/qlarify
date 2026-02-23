import { docClient } from "@/lib/db";
import { GetCommand, UpdateCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ProductClarity, ArchitectureNode, SystemLog } from "@/types/architecture";

export class SystemRepository {
    private tableName = "QlarifyCore";

    constructor(private userEmail: string) {}

    private getPK() {
        return `USER#${this.userEmail}`;
    }

    private getSK(systemId: string) {
        return `SYSTEM#${systemId}`;
    }

    public async getSystem(systemId: string) {
        const res = await docClient.send(new GetCommand({
            TableName: this.tableName,
            Key: { PK: this.getPK(), SK: this.getSK(systemId) }
        }));
        return res.Item;
    }

    public async saveSystem(item: any) {
        return await docClient.send(new PutCommand({
            TableName: this.tableName,
            Item: {
                ...item,
                PK: this.getPK(),
                SK: this.getSK(item.id)
            }
        }));
    }

    public async updateClarity(systemId: string, clarity: ProductClarity, logEntry?: SystemLog) {
        const updateExpression = logEntry 
            ? "SET productClarity = :pc, updatedAt = :ua, logs = list_append(if_not_exists(logs, :empty_list), :log)"
            : "SET productClarity = :pc, updatedAt = :ua";
        
        const expressionAttributeValues: any = {
            ":pc": clarity,
            ":ua": new Date().toISOString()
        };

        if (logEntry) {
            expressionAttributeValues[":log"] = [logEntry];
            expressionAttributeValues[":empty_list"] = [];
        }

        return await docClient.send(new UpdateCommand({
            TableName: this.tableName,
            Key: { PK: this.getPK(), SK: this.getSK(systemId) },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues
        }));
    }
}
