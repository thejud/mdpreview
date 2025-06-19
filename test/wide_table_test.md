# Wide Table Test Document

This document tests mdpreview's width control with a wide table that's approximately 400 characters across.

## Sample Data Table

Here's a wide table generated with `xan view` that demonstrates the wrapping issue:

```
┌─────────────┬──────────────────────────────────┬─────────────────────────────────┬────────────────────────────────┬─────────────────────────────────┬──────────────────────────────────┬─────────────────────────────────┐
│ employee_id │ full_name                        │ department                      │ position                       │ email_address                   │ hire_date                        │ annual_salary                   │
├─────────────┼──────────────────────────────────┼─────────────────────────────────┼────────────────────────────────┼─────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ EMP001      │ Alexandra Katherine Washington   │ Engineering & Development       │ Senior Software Engineer       │ a.washington@company.com        │ 2019-03-15                       │ $145,000                        │
│ EMP002      │ Benjamin Christopher Rodriguez   │ Marketing & Communications      │ Digital Marketing Specialist   │ b.rodriguez@company.com         │ 2020-07-22                       │ $78,500                         │
│ EMP003      │ Catherine Elizabeth Thompson     │ Human Resources & Operations    │ HR Business Partner            │ c.thompson@company.com          │ 2018-11-08                       │ $92,750                         │
│ EMP004      │ Daniel Michael Anderson         │ Finance & Accounting            │ Senior Financial Analyst       │ d.anderson@company.com          │ 2021-01-12                       │ $89,200                         │
│ EMP005      │ Elizabeth Sarah Martinez        │ Engineering & Development       │ DevOps Infrastructure Lead     │ e.martinez@company.com          │ 2019-09-30                       │ $138,750                        │
│ EMP006      │ Franklin James Wilson           │ Sales & Business Development   │ Enterprise Account Manager     │ f.wilson@company.com            │ 2020-04-18                       │ $115,600                        │
│ EMP007      │ Gabriella Marie Johnson         │ Product Management & Strategy   │ Senior Product Manager         │ g.johnson@company.com           │ 2019-12-03                       │ $132,400                        │
│ EMP008      │ Harrison David Brown            │ Customer Success & Support      │ Customer Success Manager       │ h.brown@company.com             │ 2021-06-14                       │ $84,300                         │
│ EMP009      │ Isabella Rose Davis             │ Engineering & Development       │ Principal Software Architect   │ i.davis@company.com             │ 2017-08-25                       │ $165,750                        │
│ EMP010      │ Jonathan Christopher Miller     │ Marketing & Communications      │ Content Marketing Manager      │ j.miller@company.com            │ 2020-10-07                       │ $76,800                         │
└─────────────┴──────────────────────────────────┴─────────────────────────────────┴────────────────────────────────┴─────────────────────────────────┴──────────────────────────────────┴─────────────────────────────────┘
```

## Testing Different Widths

This table should demonstrate the difference between narrow and wide page widths:

- **Default width (980px)**: The table above will likely wrap or require horizontal scrolling
- **Wide width (1400px)**: With `--width 1400`, the table should fit comfortably
- **Narrow width (600px)**: With `--width 600`, the table will definitely wrap

## Usage Examples

```bash
# Default width - table may wrap
./mdpreview.py wide_table_test.md

# Wide layout - table should fit
./mdpreview.py wide_table_test.md --width 1400

# Narrow layout - table will definitely wrap
./mdpreview.py wide_table_test.md --width 600
```

The table above is approximately 400+ characters wide and should clearly demonstrate the width control functionality.