/**
 * 选择素材（若已被选中则在选中的列表中移除对应的，若未选中则新增）
 * @param {*} selectedMaterialList
 * @param {*} item
 * @param {*} callFunc
 */
export function onSelectMaterial(selectedMaterialList, item, callFunc) {
  const newMaterial = [...selectedMaterialList];
  const index = selectedMaterialList.findIndex(materialItem => materialItem.id === item.id);
  if (index > -1) {
    newMaterial.splice(index, 1);
  } else {
    newMaterial.push(item);
  }
  callFunc(newMaterial);
}
