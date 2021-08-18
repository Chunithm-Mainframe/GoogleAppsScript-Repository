//import { Repository, SchemaKey, SchemaRow } from "./Repository";
//import { RepositorySchema } from "./RepositorySchema";

import { DatabaseTable } from "./DatabaseTable";
import { DatabaseTableSchema } from "./DatabaseTableSchema";

type SpreadsheetRecord<TRecord> = TRecord & {
    createdAt: Date;
    updatedAt: Date;
};

export class SpreadsheetDatabaseTable<TRecord, TRecordKey extends keyof TRecord> implements DatabaseTable<TRecord, TRecordKey> {
    private _columns: (keyof SpreadsheetRecord<TRecord>)[];
    private _columnBind: Record<keyof SpreadsheetRecord<TRecord>, number>;
    private _rows: SpreadsheetRecord<TRecord>[];
    private _rowBind: Record<string, number>;

    public get schema(): DatabaseTableSchema<TRecord, TRecordKey> { return this._schema; }

    public constructor(
        private readonly _schema: DatabaseTableSchema<TRecord, TRecordKey>,
        private readonly _sheet: GoogleAppsScript.Spreadsheet.Sheet) {
        this.initialize();
    }

    private initialize(): void {
        const sheetDatas = this._sheet.getDataRange().getValues();
        this.initializeColumn(sheetDatas);


        //for (let i = 1; i < sheetDatas.length; i++) {
        //    const row = this._schema.createRow();
        //    for (let j = 0; j < this._columns.length; j++) {
        //        row[this._columns[j]] = sheetDatas[i][this._columnBind[this._columns[j]]];
        //    }
        //    const rowKey = this.createRowKey(sheetDatas[i]);
        //    const searchKey = this.createSearchKey(rowKey);
        //    const rowIndex = this._rows.push(row) - 1;
        //    this._rowBind[searchKey] = rowIndex;
        //}
    }

    private initializeColumn(sheetDatas: any[][]): void {
        this._columns = this._schema.columns.slice();
        const header = sheetDatas[0];
        if (this._columns.indexOf('createdAt') === -1 && header.indexOf('createdAt') !== -1) {
            this._columns.push('createdAt');
        }
        if (this._columns.indexOf('updatedAt') === -1 && header.indexOf('updatedAt') !== -1) {
            this._columns.push('updatedAt');
        }

        this._columnBind = {} as Record<keyof SpreadsheetRecord<TRecord>, number>;
        for (let i = 0; i < header.length; i++) {
            this._columnBind[header[i]] = i;
        }
    }

    find(key: TRecordKey): TRecord {
        throw new Error("Method not implemented.");
    }

    findAll(keys: TRecordKey | TRecordKey[]): TRecord[] {
        throw new Error("Method not implemented.");
    }

    update(rows: Required<TRecord>): { added: TRecord[]; updated: TRecord[]; } {
        throw new Error("Method not implemented.");
    }

}

//type SpreadsheetRow<TSchema extends RepositorySchema> = SchemaRow<TSchema> & {
//    createdAt: Date;
//    updatedAt: Date;
//}

//export class SpreadsheetRepository<TSchema extends RepositorySchema> implements Repository<TSchema> {
//    private _columns: (keyof SpreadsheetRow<TSchema>)[];
//    private _columnBind: Record<keyof SpreadsheetRow<TSchema>, number> = null;
//    private _rows: SpreadsheetRow<TSchema>[] = [];
//    private _rowBind: { [key: string]: number } = {};

//    public constructor(private readonly _sheet: GoogleAppsScript.Spreadsheet.Sheet, private readonly _schema: TSchema) {
//    }

//    public initialize(): void {
//        this.reload();
//    }

//    public reload(flush = false): void {
//        this._rows = [];
//        this._rowBind = {};
//        if (flush) {
//            SpreadsheetApp.flush();
//        }
//        const sheetDatas = this._sheet.getDataRange().getValues();
//        if (!this._columnBind) {
//            this.initializeColumn(sheetDatas);
//        }
//        for (let i = 1; i < sheetDatas.length; i++) {
//            const row = this._schema.createRow();
//            for (let j = 0; j < this._columns.length; j++) {
//                row[this._columns[j]] = sheetDatas[i][this._columnBind[this._columns[j]]];
//            }
//            const rowKey = this.createRowKey(sheetDatas[i]);
//            const searchKey = this.createSearchKey(rowKey);
//            const rowIndex = this._rows.push(row) - 1;
//            this._rowBind[searchKey] = rowIndex;
//        }
//    }

//    private initializeColumn(sheetDatas: any[][]): void {
//        this._columns = this._schema.columns.slice();
//        const header = sheetDatas[0];
//        if (this._columns.indexOf('createdAt') === -1 && header.indexOf('createdAt') !== -1) {
//            this._columns.push('createdAt');
//        }
//        if (this._columns.indexOf('updatedAt') === -1 && header.indexOf('updatedAt') !== -1) {
//            this._columns.push('updatedAt');
//        }

//        this._columnBind = {} as Record<keyof SpreadsheetRow<TSchema>, number>;
//        for (let i = 0; i < header.length; i++) {
//            this._columnBind[header[i]] = i;
//        }
//    }

//    private createRowKey(record: any[]): SchemaKey<TSchema> {
//        const rowKey = {} as SchemaKey<TSchema>;
//        for (const key of this._schema.keys as string[]) {
//            const index = this._columnBind[key];
//            rowKey[key] = record[index];
//        }
//        return rowKey;
//    }

//    public get rows(): Readonly<SchemaRow<TSchema>>[] {
//        return this._rows.slice();
//    }

//    public find(key: SchemaKey<TSchema>): SchemaRow<TSchema> {
//        const searchKey = this.createSearchKey(key);
//        const index = this._rowBind[searchKey];
//        return this._rows[index];
//    }

//    public findAll(keys: SchemaKey<TSchema>[]): SchemaRow<TSchema>[] {
//        const ret: SchemaRow<TSchema>[] = [];
//        for (const key of keys) {
//            const searchKey = this.createSearchKey(key);
//            const index = this._rowBind[searchKey];
//            ret.push(this._rows[index]);
//        }
//        return ret;
//    }

//    public update(rows: SchemaRow<TSchema> | SchemaRow<TSchema>[]) {
//        if (!Array.isArray(rows)) {
//            rows = [rows];
//        }

//        const convertedRows = rows.map(r => this.convertRow(r));
//        const addedRows: SpreadsheetRow<TSchema>[] = [];
//        const updatedRows: { key: string; row: SpreadsheetRow<TSchema> }[] = [];
//        for (const row of convertedRows) {
//            const key = this.createSearchKey(row);
//            if (key in this._rowBind) {
//                updatedRows.push({ key: key, row: row });
//            }
//            else {
//                addedRows.push(row);
//            }
//        }

//        let minRowIndex = -1;
//        let maxRowIndex = -1;
//        for (const updated of updatedRows) {
//            //updated.row.rowId = this._rows[this._rowBind[updated.key]].rowId;
//            updated.row.createdAt = this._rows[this._rowBind[updated.key]].createdAt;
//            updated.row.updatedAt = new Date();
//            this._rows[this._rowBind[updated.key]] = updated.row;

//            if (minRowIndex < 0 || minRowIndex > this._rowBind[updated.key]) {
//                minRowIndex = this._rowBind[updated.key];
//            }
//            if (maxRowIndex < 0 || maxRowIndex < this._rowBind[updated.key]) {
//                maxRowIndex = this._rowBind[updated.key];
//            }
//        }
//        if (addedRows.length > 0) {
//            for (const added of addedRows) {
//                const primaryColumn = this._schema.primaryColumn as keyof SpreadsheetRow<TSchema>;
//                if (primaryColumn) {
//                    added[primaryColumn] = this._rows.length + 1;
//                    added['hoge'] = this._rows.length + 1;
//                }
//                added.createdAt = new Date();
//                added.updatedAt = new Date();
//                const searchKey = this.createSearchKey(added);
//                const rowIndex = this._rows.push(added) - 1;
//                this._rowBind[searchKey] = rowIndex;

//                if (minRowIndex < 0 || minRowIndex > rowIndex) {
//                    minRowIndex = rowIndex;
//                }
//                if (maxRowIndex < 0 || maxRowIndex < rowIndex) {
//                    maxRowIndex = rowIndex;
//                }
//            }
//        }

//        if (minRowIndex >= 0 && maxRowIndex >= 0) {
//            const rawObjects: any[][] = [];
//            for (let i = minRowIndex; i <= maxRowIndex; i++) {
//                const obj = this.toRawObject(this._rows[i]);
//                rawObjects.push(obj);
//            }

//            this._sheet.getRange(minRowIndex + 2, 1, maxRowIndex - minRowIndex + 1, this._columns.length).setValues(rawObjects);
//        }

//        return {
//            added: addedRows,
//            updated: updatedRows,
//        };
//    }

//    private createSearchKey(rowKey: SchemaKey<TSchema> | SchemaRow<TSchema>): string {
//        let searchKey = "";
//        for (const key of this._schema.keys) {
//            if (searchKey) {
//                searchKey += "," + rowKey[key];
//            }
//            else {
//                searchKey = rowKey[key].toString();
//            }
//        }
//        return searchKey;
//    }

//    private convertRow(row: SchemaRow<TSchema>): SpreadsheetRow<TSchema> {
//        const obj = Object.assign({}, row) as SpreadsheetRow<TSchema>;
//        if (obj.createdAt === null) {
//            obj.createdAt = null;
//        }
//        if (obj.updatedAt === null) {
//            obj.updatedAt = null;
//        }
//        return obj as SpreadsheetRow<TSchema>;
//    }

//    private toRawObject(row: SpreadsheetRow<TSchema>): any[] {
//        const ret: any[] = new Array(this._columns.length);
//        for (const column of this._columns) {
//            ret[this._columnBind[column]] = row[column];
//        }
//        return ret;
//    }
//}