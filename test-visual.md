# Visual Features Test

## Local Images

Here's a local test image:

![Test Image](test/test_image.png)

## Remote Images

Remote image from placeholder service:

![Remote](https://via.placeholder.com/150x100/0969da/ffffff?text=Remote+Image)

## Mermaid Diagram

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    C --> E[End]
    D --> E
```

## Another Mermaid

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant MDPreview
    User->>MDPreview: Convert markdown
    MDPreview->>Browser: Open HTML
    Browser->>User: Display result
```

## Mixed Content

This tests both **images** and *mermaid diagrams* together.

![Another Test](test/test_image.jpg)

## Code Block (Not Mermaid)

```python
def hello():
    print("This should NOT be a mermaid diagram")
```
