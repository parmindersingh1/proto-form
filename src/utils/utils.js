export function getByKey(listOfTuples, key) {
  return listOfTuples ? listOfTuples.find(([k]) => k === key)?.[1] : undefined;
}
