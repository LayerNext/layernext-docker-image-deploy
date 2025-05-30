var raw_connection_id = "xxxxxxxxxxxxx";
var layernext_connection_id = "xxxxxxxxxxxxx";

var ln_tables = db.TableData.find({ connectionId: layernext_connection_id }).toArray();
print(ln_tables);

var ln_table_field_map = {};

for (var table of ln_tables) {
    if (table["fields"] && Array.isArray(table["fields"])) {
        ln_table_field_map[table["tableName"]] = table["fields"].map(f => f.name);
    } else {
        ln_table_field_map[table["tableName"]] = []; // Handle missing fields gracefully
    }
}

print(ln_table_field_map);


for (var table in ln_table_field_map) {
    db.TableData.updateMany(
        {
            connectionId: raw_connection_id,
            tableName: table
        },
        {
            $set: {
                'isVisibleToAI': true,
                'fields.$[field].isVisibleToAI': true,
            }
        },
        {
            arrayFilters: [
                {
                    'field.name': { $in: ln_table_field_map[table] },
                },
            ]
        }
    )
}
