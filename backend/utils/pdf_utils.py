from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from io import BytesIO

def generate_invoice_pdf(order, items):
    """
    Generates a PDF invoice for the given order and items.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()

    # Title
    elements.append(Paragraph("Shopsea - Order Invoice", styles['Title']))
    elements.append(Spacer(1, 12))

    # Order Info
    elements.append(Paragraph(f"Order ID: {order['id']}", styles['Normal']))
    elements.append(Paragraph(f"Date: {order['created_at'].strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    elements.append(Paragraph(f"Customer: {order['email']}", styles['Normal']))
    elements.append(Paragraph(f"Shipping Address: {order['shipping_address']}", styles['Normal']))
    elements.append(Spacer(1, 24))

    # Table Header
    data = [["Product", "Quantity", "Price", "Total"]]
    
    # Table Content
    for item in items:
        data.append([
            item.get("name", "Product"),
            str(item["quantity"]),
            f"₹{item['price']:.2f}",
            f"₹{item['quantity'] * item['price']:.2f}"
        ])
    
    # Subtotal
    data.append(["", "", "Total:", f"₹{order['total_price']:.2f}"])

    # Create Table
    table = Table(data, colWidths=[250, 70, 80, 80])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ALIGN', (0, 3), (-1, -1), 'RIGHT'),
    ]))
    
    elements.append(table)
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer
