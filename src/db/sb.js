import { TABLE_NAMES } from "../helpers/flow";
import { supabase } from "./sb.config";

export function SBCheckNoLoadError(data) {
  return Object.keys(data).includes("code") ? false : true;
}
///
export async function SBLoadItems(tableName = TABLE_NAMES.TRUCKS) {
  let { data, error } = await supabase.from(tableName).select("*");

  if (error) return error;

  return data;
}

export async function SBUpdateItemWithID(
  itemNewData,
  tableName,
  onItemUpdated,
  onItemUpdateError
) {
  const { data, error } = await supabase
    .from(tableName)
    .update(itemNewData)
    .eq("id", itemNewData.id)
    .select();

  if (error) {
    console.log(error);
    onItemUpdateError(error);
    return;
  }

  console.log(data);
  onItemUpdated(data);
}

export async function SBUpdateRL(
  tableName,
  new_data,
  selectedMonthData,
  keyColName,
  keyColVal,
  keyColName2,
  keyColVal2
) {
  let { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("agent_id", new_data.id)
    .eq("rlcode", selectedMonthData.rlcode);

  const record_exists = error === null && data.length === 1;

  console.log(
    ` Checking for item from ${tableName} where ${keyColName} = '${keyColVal}' & ${keyColName2} = '${keyColVal2}', record exists ${record_exists}  `
  );

  console.log(data, error);
  if (record_exists) {
    await SBUpdateItemWithID(
      new_data,
      tableName,
      (res) => {
        console.log(`Item updated! res : ${res}`);
      },
      (e) => {
        console.log(`Update error! res : ${JSON.stringify(e)}`);
      }
    );
  } else {
    await SBInsertItem(
      new_data,
      tableName,
      (res) => {
        console.log(`Item inserted. Res : ${JSON.stringify(res)}`);
      },
      (e) => console.log(`Insert error : ${JSON.stringify(e)}`)
    );
  }
}

export async function SBUpdateItem(
  itemToUpdate,
  tableName,
  columnToUpdate,
  updateValue,
  keyColumn = "id",
  allData = false
) {
  const dataToUpdate = allData
    ? itemToUpdate
    : { [columnToUpdate]: updateValue };

  const { data, error } = await supabase
    .from(tableName)
    .update(dataToUpdate)
    .eq(keyColumn, itemToUpdate.id)
    .select();

  console.log("SBUpdate ... => \n", itemToUpdate, data, " => \n", error);

  if (error) return error;

  return data;
}

export async function SBInsertItem(
  newItem,
  tableName,
  onItemInserted,
  onItemInsertError
) {
  const { data, error } = await supabase
    .from(tableName)
    .insert([newItem])
    .select();

  console.log("SBInsertItem", "data ==>> \n", data, "error ==>> \n", error);

  if (error) {
    if (onItemInsertError) {
      onItemInsertError(error);
    }

    console.log(error);
    return error;
  }

  if (onItemInserted) onItemInserted(data);
  return data;
}

export async function SBRemoveItem(
  itemToRemove,
  tableName,
  keyColumn = "id",
  onSuccess,
  onFailure
) {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq(keyColumn, itemToRemove.id);

  if (error) {
    console.log(error);
    if (onFailure) onFailure(error);
    return error;
  }

  if (onSuccess) onSuccess(itemToRemove);
  return true;
}

export async function SBUploadFile(bucketName, fileName, file) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });
}

export async function SBLoadItemWhereColEqVal(tableName, colName, value) {
  let { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq(colName, value);

  if (error) return error;

  return data;
}
