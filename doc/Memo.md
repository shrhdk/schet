## Common Step

1. Check method signature.
1. Sanitize parameters.
  1. Remove whitespace at both ends.
1. Check parameter format.

## Create (data)

1. Determine the document ID
1. Construct the document.
1. Insert the document to DB

## Read (id)

1. Read the document from DB

## Update (id, diff)

1. Read the existing document from DB.
1. Handle DB Error.
1. Modify the document.
1. Construct the difference.
1. Apply Diference to DB.

## Delete (id)

1. Delete the document from DB

## Common Step

1. Handle DB Error.
1. Sanitize Result.
1. Return Result.


(*1)

1. (ドキュメント内IDの存在検査) -> return XxxNotFoundError
1. Check fixed or unfixed. -> return FixedEventError
1. Check value duplication (except self ID) -> return DuplicatedXxxError
1. Update Presence/Absence Table
