#!/usr/bin/env node

// generate-arguments-tests: generate test cases for feeding wrong arguments
// types into each of the core functions

const formats = [
    {
        "name": "add",
        "signatures":
        [
            ["number", "number"]
        ]
    },
    {
        "name": "subtract",
        "signatures":
        [
            ["number", "number"]
        ]
    },
    {
        "name": "multiply",
        "signatures":
        [
            ["number", "number"]
        ]
    },
    {
        "name": "divide",
        "signatures":
        [
            ["number", "number"]
        ]
    },
    {
        "name": "modulo",
        "signatures":
        [
            ["number", "number"]
        ]
    },
    {
        "name": "truncate",
        "signatures":
        [
            ["number"]
        ]
    },
    {
        "name": "and",
        "signatures":
        [
            ["boolean", "boolean"]
        ]
    },
    {
        "name": "or",
        "signatures":
        [
            ["boolean", "boolean"]
        ]
    },
    {
        "name": "not",
        "signatures":
        [
            ["boolean"]
        ]
    },
    {
        "name": "precedes",
        "signatures":
        [
            ["null|boolean|number|string|list|map|function", "null|boolean|number|string|list|map|function"]
        ]
    },
    {
        "name": "succeeds",
        "signatures":
        [
            ["null|boolean|number|string|list|map|function", "null|boolean|number|string|list|map|function"]
        ]
    },
    {
        "name": "equals",
        "signatures":
        [
            ["null|boolean|number|string|list|map|function", "null|boolean|number|string|list|map|function"]
        ]
    },
    {
        "name": "write",
        "signatures":
        [
            ["string", "number|string"]
        ]
    },
    {
        "name": "read",
        "signatures":
        [
            ["number|string", "null|string"]
        ]
    },
    {
        "name": "delete",
        "signatures":
        [
            ["number|string"]
        ]
    },
    {
        "name": "query",
        "signatures":
        [
            ["string"]
        ]
    },
    {
        "name": "evaluate",
        "signatures":
        [
            ["string"]
        ]
    },
    {
        "name": "freeze",
        "signatures":
        [
            ["null|boolean|number|string|list|map|function"]
        ]
    },
    {
        "name": "thaw",
        "signatures":
        [
            ["string"]
        ]
    },
    {
        "name": "type",
        "signatures":
        [
            ["null|boolean|number|string|list|map|function"]
        ]
    },
    {
        "name": "cast",
        "signatures":
        [
            ["null|boolean|number|string|list|map|function", "string"]
        ]
    },
    {
        "name": "get",
        "signatures":
        [
            ["string|list", "number"],
            ["map", "string"]
        ]
    },
    {
        "name": "set",
        "signatures":
        [
            ["string", "number", "string"],
            ["list", "number", "null|boolean|number|string|list|map|function"],
            ["map", "string", "null|boolean|number|string|list|map|function"]
        ]
    },
    {
        "name": "unset",
        "signatures":
        [
            ["string|list", "number"],
            ["map", "string"]
        ]
    },
    {
        "name": "merge",
        "signatures":
        [
            ["string", "string"],
            ["list", "list"],
            ["map", "map"]
        ]
    },
    {
        "name": "length",
        "signatures":
        [
            ["string|list|map"]
        ]
    },
    {
        "name": "keys",
        "signatures":
        [
            ["string|list|map"]
        ]
    },
    {
        "name": "sort",
        "signatures":
        [
            ["list", "string"]
        ]
    },
];
const values = {
    "null": "null",
    "boolean": "false",
    "number": "0",
    "string": '""',
    "list": "[]",
    "map": "{}",
    "function": "<>"
};

// ASSUME: all signatures are the same length
for (const format of formats) {
    const name = format.name;

    if (format.signatures.length === 0) {
        throw `${name} format found without signatures`;
    }

    const expectedLength = format.signatures[0].length;

    for (const signature of format.signatures) {
        if (signature.length !== expectedLength) {
            throw `${name} format found with an oddly sized signature`;
        }
    }
}

for (const format of formats) {
    const name = format.name;
    const signatures = format.signatures;
    const expectedLength = signatures[0].length;

    for (const attempt of enumeratePossibleSignatures(expectedLength)) {
        let supportedSoFar = false;

        for (let signature of signatures) {
            signature = signature.map(argument => argument.split('|'));

            if (isSupportedSoFar(attempt, signature)) {
                supportedSoFar = true;
                break;
            }
        }

        if (supportedSoFar) {
            const actualLength = attempt.length;

            if (actualLength !== expectedLength) {
                console.log(toTestSource(name, attempt, '"absent argument"'));
            }
        } else {
            console.log(toTestSource(name, attempt, '"alien argument"'));
        }
    }
}

function* enumeratePossibleSignatures(length) {
    if (length > 0) {
        for (const type of Object.keys(values)) {
            yield [type];

            for (const path of enumeratePossibleSignatures(length - 1)) {
                yield [type, ...path];
            }
        }
    }
}

function isSupportedSoFar(attempt, signature) {
    for (let i = 0; i < attempt.length; i++) {
        const left = attempt[i];
        const right = signature[i];

        if (!right.includes(left)) {
            return false;
        }
    }

    return true;
}

function toTestSource(name, attempt, issue) {
    const body = attempt.map(type => values[type]).join(", ");
    return `$throws(<import "${name}" from core $${name}(${body})>, ${issue})`;
}
