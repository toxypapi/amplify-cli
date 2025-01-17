"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function collectAndMergeFields(selectionSet, mergeInFragmentSpreads = true) {
    const groupedFields = new Map();
    function visitSelectionSet(selections, possibleTypes, conditions = []) {
        if (possibleTypes.length < 1)
            return;
        for (const selection of selections) {
            switch (selection.kind) {
                case 'Field':
                    let groupForResponseKey = groupedFields.get(selection.responseKey);
                    if (!groupForResponseKey) {
                        groupForResponseKey = [];
                        groupedFields.set(selection.responseKey, groupForResponseKey);
                    }
                    groupForResponseKey.push(Object.assign(Object.assign({}, selection), { isConditional: conditions.length > 0, conditions, selectionSet: selection.selectionSet
                            ? {
                                possibleTypes: selection.selectionSet.possibleTypes,
                                selections: [...selection.selectionSet.selections],
                            }
                            : undefined }));
                    break;
                case 'FragmentSpread':
                case 'TypeCondition':
                    if (selection.kind === 'FragmentSpread' && !mergeInFragmentSpreads)
                        continue;
                    if (!possibleTypes.every(type => selection.selectionSet.possibleTypes.includes(type)))
                        continue;
                    visitSelectionSet(selection.selectionSet.selections, possibleTypes, conditions);
                    break;
                case 'BooleanCondition':
                    visitSelectionSet(selection.selectionSet.selections, possibleTypes, [...conditions, selection]);
                    break;
            }
        }
    }
    visitSelectionSet(selectionSet.selections, selectionSet.possibleTypes);
    const fields = Array.from(groupedFields.values()).map(fields => {
        const isFieldIncludedUnconditionally = fields.some(field => !field.isConditional);
        return fields
            .map(field => {
            if (isFieldIncludedUnconditionally && field.isConditional && field.selectionSet) {
                field.selectionSet.selections = wrapInBooleanConditionsIfNeeded(field.selectionSet.selections, field.conditions);
            }
            return field;
        })
            .reduce((field, otherField) => {
            field.isConditional = field.isConditional && otherField.isConditional;
            if (field.conditions && otherField.conditions) {
                field.conditions = [...field.conditions, ...otherField.conditions];
            }
            else {
                field.conditions = undefined;
            }
            if (field.selectionSet && otherField.selectionSet) {
                field.selectionSet.selections.push(...otherField.selectionSet.selections);
            }
            return field;
        });
    });
    if (selectionSet.possibleTypes.length == 1) {
        const type = selectionSet.possibleTypes[0];
        const fieldDefMap = type.getFields();
        for (const field of fields) {
            const fieldDef = fieldDefMap[field.name];
            if (fieldDef && fieldDef.description) {
                field.description = fieldDef.description;
            }
        }
    }
    return fields;
}
exports.collectAndMergeFields = collectAndMergeFields;
function wrapInBooleanConditionsIfNeeded(selections, conditions) {
    if (!conditions || conditions.length == 0)
        return selections;
    const [condition, ...rest] = conditions;
    return [
        Object.assign(Object.assign({}, condition), { selectionSet: {
                possibleTypes: condition.selectionSet.possibleTypes,
                selections: wrapInBooleanConditionsIfNeeded(selections, rest),
            } }),
    ];
}
exports.wrapInBooleanConditionsIfNeeded = wrapInBooleanConditionsIfNeeded;
//# sourceMappingURL=collectAndMergeFields.js.map