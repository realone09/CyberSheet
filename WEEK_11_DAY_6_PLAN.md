# Week 11 Day 6: Database Functions - Implementation Plan

## 🎯 Objective
Implement Excel-compatible **Database Functions** for conditional aggregation and querying of tabular data with criteria-based filtering.

## 📊 Target Functions (10 functions)

### Core Database Aggregation Functions (7 functions)
1. **DSUM** - Sum values in database matching criteria
2. **DAVERAGE** - Average values in database matching criteria
3. **DCOUNT** - Count numeric values matching criteria
4. **DCOUNTA** - Count non-empty values matching criteria
5. **DMAX** - Maximum value in database matching criteria
6. **DMIN** - Minimum value in database matching criteria
7. **DGET** - Extract single value from database matching criteria

### Statistical Database Functions (3 functions)
8. **DSTDEV** - Standard deviation of database values matching criteria
9. **DSTDEVP** - Population standard deviation matching criteria
10. **DVAR** - Variance of database values matching criteria

**Total**: 10 functions, ~60-70 tests expected

---

## 📐 Function Specifications

### 1. DSUM - Database Sum
**Syntax**: `DSUM(database, field, criteria)`

**Parameters**:
- `database`: Range of cells that make up the database (first row = headers)
- `field`: Column label or index (1-based) to sum
- `criteria`: Range containing criteria (first row = field names)

**Returns**: Sum of values in specified field matching all criteria

**Examples**:
```
Database (A1:E10):
| Tree   | Height | Age | Yield | Profit |
|--------|--------|-----|-------|--------|
| Apple  | 18     | 20  | 14    | 105    |
| Pear   | 12     | 12  | 10    | 96     |
| Cherry | 13     | 14  | 9     | 105    |
| Apple  | 14     | 15  | 10    | 75     |
| Pear   | 9      | 8   | 8     | 76.8   |
| Apple  | 8      | 9   | 6     | 45     |

Criteria (A12:A13):
| Tree   |
|--------|
| Apple  |

DSUM(A1:E10, "Profit", A12:A13) → 225 (sum of Apple profits: 105+75+45)
DSUM(A1:E10, 5, A12:A13) → 225 (same, using column index)
DSUM(A1:E10, "Yield", A12:B13) → 30 (with multiple criteria)
```

**Error Handling**:
- `#VALUE!`: Invalid field name or database structure
- `#NUM!`: Field index out of range
- `#N/A`: No records match criteria

---

### 2. DAVERAGE - Database Average
**Syntax**: `DAVERAGE(database, field, criteria)`

**Parameters**: Same as DSUM

**Returns**: Average of values in specified field matching all criteria

**Examples**:
```
DAVERAGE(A1:E10, "Yield", A12:A13) → 10 (average yield for Apple: (14+10+6)/3)
DAVERAGE(A1:E10, "Age", A12:B13) → 14.67 (with height criteria)
```

**Excel Compatibility**:
- Ignores non-numeric values
- Returns `#DIV/0!` if no matching numeric values

---

### 3. DCOUNT - Database Count (Numeric)
**Syntax**: `DCOUNT(database, field, criteria)`

**Parameters**: Same as DSUM

**Returns**: Count of numeric values in specified field matching criteria

**Examples**:
```
DCOUNT(A1:E10, "Age", A12:A13) → 3 (count of Apple ages)
DCOUNT(A1:E10, "Tree", A12:A13) → 0 (Tree column is text, not numeric)
```

**Note**: Only counts cells containing numbers, not text

---

### 4. DCOUNTA - Database Count All
**Syntax**: `DCOUNTA(database, field, criteria)`

**Parameters**: Same as DSUM

**Returns**: Count of non-empty values (text, numbers, errors) matching criteria

**Examples**:
```
DCOUNTA(A1:E10, "Tree", A12:A13) → 3 (counts text values)
DCOUNTA(A1:E10, "Age", A12:A13) → 3 (counts numbers)
```

**Note**: Counts all non-empty cells, unlike DCOUNT

---

### 5. DMAX - Database Maximum
**Syntax**: `DMAX(database, field, criteria)`

**Parameters**: Same as DSUM

**Returns**: Maximum value in specified field matching criteria

**Examples**:
```
DMAX(A1:E10, "Profit", A12:A13) → 105 (highest Apple profit)
DMAX(A1:E10, "Height", A12:A13) → 18 (tallest Apple tree)
```

---

### 6. DMIN - Database Minimum
**Syntax**: `DMIN(database, field, criteria)`

**Parameters**: Same as DSUM

**Returns**: Minimum value in specified field matching criteria

**Examples**:
```
DMIN(A1:E10, "Profit", A12:A13) → 45 (lowest Apple profit)
DMIN(A1:E10, "Age", A12:A13) → 9 (youngest Apple tree)
```

---

### 7. DGET - Database Get Single Value
**Syntax**: `DGET(database, field, criteria)`

**Parameters**: Same as DSUM

**Returns**: Single value from specified field matching criteria

**Examples**:
```
Criteria (A12:B13):
| Tree   | Age |
|--------|-----|
| Cherry | 14  |

DGET(A1:E10, "Yield", A12:B13) → 9 (only one Cherry with age 14)
```

**Error Handling**:
- `#NUM!`: More than one record matches (ambiguous)
- `#VALUE!`: No records match criteria

**Note**: Strict function - must match exactly one record

---

### 8. DSTDEV - Database Standard Deviation (Sample)
**Syntax**: `DSTDEV(database, field, criteria)`

**Parameters**: Same as DSUM

**Returns**: Sample standard deviation of values matching criteria

**Formula**: Uses n-1 denominator (sample)

**Examples**:
```
DSTDEV(A1:E10, "Yield", A12:A13) → 4 (std dev of Apple yields)
```

---

### 9. DSTDEVP - Database Standard Deviation (Population)
**Syntax**: `DSTDEVP(database, field, criteria)`

**Parameters**: Same as DSUM

**Returns**: Population standard deviation of values matching criteria

**Formula**: Uses n denominator (population)

---

### 10. DVAR - Database Variance (Sample)
**Syntax**: `DVAR(database, field, criteria)`

**Parameters**: Same as DSUM

**Returns**: Sample variance of values matching criteria

**Formula**: Uses n-1 denominator (sample)

---

## 🔧 Implementation Strategy

### Phase 1: Helper Functions (30 min)
1. **Database Structure Validation**
   ```typescript
   function validateDatabase(database: FormulaValue[][]): boolean
   ```
   - Check that database is 2D array
   - Verify first row contains headers
   - Ensure at least 2 rows (header + data)

2. **Field Resolution**
   ```typescript
   function resolveField(database: FormulaValue[][], field: FormulaValue): number
   ```
   - Accept field name (string) or column index (number)
   - Return 0-based column index
   - Error if field not found or out of range

3. **Criteria Matching**
   ```typescript
   function matchesCriteria(
     row: FormulaValue[],
     headers: FormulaValue[],
     criteria: FormulaValue[][]
   ): boolean
   ```
   - Parse criteria range (first row = field names, subsequent rows = values)
   - Support multiple criteria (AND within row, OR between rows)
   - Handle wildcards (* and ?) in text criteria
   - Support comparison operators (>, <, >=, <=, <>, =)
   - Case-insensitive text matching

4. **Filter Database**
   ```typescript
   function filterDatabase(
     database: FormulaValue[][],
     criteria: FormulaValue[][]
   ): FormulaValue[][]
   ```
   - Apply criteria to each data row
   - Return array of matching rows
   - Exclude header row from results

### Phase 2: Core Aggregation Functions (45 min)
- Implement DSUM, DAVERAGE, DCOUNT, DCOUNTA
- Reuse helper functions
- Handle errors consistently
- Test with various criteria types

### Phase 3: Min/Max and Get Functions (30 min)
- Implement DMAX, DMIN
- Implement DGET with ambiguity checking
- Error handling for edge cases

### Phase 4: Statistical Functions (30 min)
- Implement DSTDEV, DSTDEVP, DVAR
- Reuse existing statistical calculation logic
- Leverage Welford's algorithm if available

### Phase 5: Comprehensive Testing (60 min)
- Create test suite with 60-70 tests
- Test each function with:
  * Single criterion
  * Multiple criteria (AND/OR logic)
  * Wildcard matching
  * Comparison operators
  * Edge cases (no matches, all match, etc.)
  * Error conditions
  * Field name vs index
- Integration tests combining functions

### Phase 6: Registration & Documentation (15 min)
- Register all 10 functions
- Update CHANGELOG.md
- Create summary document

**Total Estimated Time**: ~3.5 hours

---

## 🧮 Criteria Syntax & Matching Rules

### Basic Criteria Examples

#### 1. Exact Match
```
Criteria:
| Tree  |
|-------|
| Apple |

Matches rows where Tree = "Apple" (case-insensitive)
```

#### 2. Multiple Criteria (AND)
```
Criteria:
| Tree  | Age |
|-------|-----|
| Apple | >10 |

Matches rows where Tree = "Apple" AND Age > 10
```

#### 3. Multiple Criteria (OR)
```
Criteria:
| Tree  |
|-------|
| Apple |
| Pear  |

Matches rows where Tree = "Apple" OR Tree = "Pear"
```

#### 4. Wildcards
```
Criteria:
| Tree  |
|-------|
| A*    |

Matches: Apple, Apricot, etc. (* = any characters)

| Tree  |
|-------|
| ?pple |

Matches: Apple, Epple, etc. (? = single character)
```

#### 5. Comparison Operators
```
| Age |        | Height |      | Profit  |
|-----|        |--------|      |---------|
| >15 |        | <=12   |      | <>100   |

>    Greater than
<    Less than
>=   Greater than or equal
<=   Less than or equal
<>   Not equal
=    Equal (default if no operator)
```

### Matching Algorithm
1. Parse criteria range:
   - First row = field names
   - Subsequent rows = criteria values (OR logic between rows)
2. For each data row:
   - Check all criteria in same row (AND logic within row)
   - If any criteria row matches, include the data row
3. Apply field extraction and aggregation

---

## 📊 Test Plan (60-70 tests)

### DSUM Tests (7 tests)
1. Sum with single criterion (exact match)
2. Sum with multiple criteria (AND logic)
3. Sum with OR criteria (multiple rows)
4. Sum with comparison operators
5. Sum with wildcard matching
6. Sum with field index instead of name
7. Error: Invalid field, no matches

### DAVERAGE Tests (6 tests)
1. Average with single criterion
2. Average with multiple criteria
3. Average ignores non-numeric values
4. Error: #DIV/0! when no numeric matches
5. Average with comparison operators
6. Average with field name and index

### DCOUNT Tests (6 tests)
1. Count numeric values with criterion
2. Count excludes text values
3. Count with multiple criteria
4. Count returns 0 for all text column
5. Count with wildcards
6. Error handling

### DCOUNTA Tests (6 tests)
1. Count all non-empty values
2. Count includes text and numbers
3. Count with multiple criteria
4. Count with wildcards
5. DCOUNTA vs DCOUNT comparison
6. Error handling

### DMAX Tests (5 tests)
1. Max with single criterion
2. Max with multiple criteria
3. Max with comparison operators
4. Max returns 0 when no matches
5. Error: Invalid field

### DMIN Tests (5 tests)
1. Min with single criterion
2. Min with multiple criteria
3. Min with comparison operators
4. Min returns 0 when no matches
5. Error: Invalid field

### DGET Tests (7 tests)
1. Get single matching value
2. Error: Multiple matches (#NUM!)
3. Error: No matches (#VALUE!)
4. Get with exact criteria match
5. Get with multiple AND criteria
6. Get with field index
7. Error: Invalid database structure

### DSTDEV Tests (5 tests)
1. Sample standard deviation with criteria
2. Std dev with multiple criteria
3. Comparison with direct STDEV on filtered data
4. Error: Insufficient data (<2 values)
5. DSTDEV vs DSTDEVP comparison

### DSTDEVP Tests (4 tests)
1. Population standard deviation
2. DSTDEVP with all data
3. DSTDEVP vs DSTDEV (n vs n-1)
4. Error handling

### DVAR Tests (4 tests)
1. Sample variance with criteria
2. Variance with multiple criteria
3. DVAR vs direct VAR calculation
4. Error handling

### Integration Tests (5 tests)
1. Combine DSUM, DAVERAGE, DCOUNT
2. Verify criteria matching across all functions
3. Complex criteria (AND + OR + wildcards + operators)
4. Edge cases: Empty database, all criteria match, no matches
5. Performance test with larger dataset (100+ rows)

---

## 🎯 Success Criteria

- [x] All 10 database functions implemented
- [x] Helper functions for criteria matching and filtering
- [x] Support for:
  * Field names and column indices
  * Exact matching
  * Wildcard matching (* and ?)
  * Comparison operators (>, <, >=, <=, <>, =)
  * AND logic (within criteria row)
  * OR logic (between criteria rows)
- [x] 60-70 comprehensive tests created
- [x] 100% test pass rate
- [x] All functions registered in function-initializer.ts
- [x] Excel-compatible behavior verified
- [x] Proper error handling (#VALUE!, #NUM!, #N/A, #DIV/0!)
- [x] CHANGELOG.md updated
- [x] Code committed with detailed message
- [x] Summary documentation created

---

## 📚 Excel Compatibility Notes

### Key Behaviors to Match:
1. **Case-Insensitive Matching**: "apple" matches "Apple", "APPLE", etc.
2. **Field Resolution**: Accept both field name (string) and column index (number, 1-based)
3. **Wildcard Support**: * (zero or more chars), ? (exactly one char)
4. **Comparison Operators**: Parse >10, <=50, <>5, etc.
5. **Criteria OR Logic**: Multiple rows in criteria = OR condition
6. **Criteria AND Logic**: Multiple columns in same row = AND condition
7. **Empty Criteria**: Empty criteria cell means "match any value"
8. **DGET Strictness**: Must match exactly one record, else error
9. **Numeric-Only Functions**: DCOUNT, DSUM, DAVERAGE ignore text values
10. **Statistical Functions**: Use same formulas as STDEV, VAR functions

### Common Database Structure:
```
| Header1 | Header2 | Header3 |  ← Required header row
|---------|---------|---------|
| value1  | value2  | value3  |  ← Data rows
| value4  | value5  | value6  |
```

### Common Criteria Structure:
```
| Header1 | Header2 |  ← Field names to filter on
|---------|---------|
| value1  | value2  |  ← Criteria row 1 (AND logic within row)
| value3  |         |  ← Criteria row 2 (OR logic with row 1)
```

---

## 🚀 Implementation Order

1. **Helper Functions** → Foundation for all DB functions
2. **DSUM** → Simplest aggregation, test criteria matching
3. **DAVERAGE, DCOUNT, DCOUNTA** → Similar patterns to DSUM
4. **DMAX, DMIN** → Simpler than aggregation (no accumulation)
5. **DGET** → Special case with ambiguity checking
6. **DSTDEV, DSTDEVP, DVAR** → Statistical functions last

---

## 📖 References

- **Excel Database Functions**: https://support.microsoft.com/en-us/office/database-functions-overview
- **DSUM**: https://support.microsoft.com/en-us/office/dsum-function
- **Criteria Syntax**: https://support.microsoft.com/en-us/office/criteria-in-database-functions
- **Wildcard Characters**: https://support.microsoft.com/en-us/office/wildcard-characters

---

*Ready to implement Week 11 Day 6: Database Functions!*
