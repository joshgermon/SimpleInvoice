import PDFDocument from 'pdfkit';

export function createInvoice(req, res) {
    // Create Document
    const doc = new PDFDocument({
        size: 'A4',
        margins: {
            top: 40,
            bottom: 40,
            left: 55,
            right: 55,
        },
        info: {
            Title: `Invoice - ${req.body.name}`,
            Author: "Angela & Josh Photography",
        }
    });

    // Pipe as response
    doc.pipe(res);      
    doc.registerFont('Heading', 'Inter-SemiBold.ttf');
    doc.registerFont('Regular', 'Inter-Regular.ttf');

    // Add Header & Top line
    addHeader(doc);
    addTopLine(doc, req.body.name);
    addInvoiceTable(doc, req.body.items)
    addFooter(doc, calculateTotal(req.body.items));

    doc.end();
}

function addHeader(doc) {
    doc.rect(0, 0, 620, 125).fill('#f8f2f0');
    doc.image('./logo-dark.png', 55, 50, { width: 150 });
    doc.fill('#66514a');
}

function addTopLine(doc, name) {
    const TODAY = new Date(Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    doc
        .fontSize(16)
        .font('Heading')
        .text(name, 55, 165)
        .fontSize(11)
        .font('Regular')
        .moveDown(1.25)
        .fill('#887873')
        .text(`Date Issued: ${TODAY}\nInvoice number: 1702223`, {
            width: 500,
            align: 'left',
            indent: 0,
            height: 100,
            lineGap: 10,
        });
}

function addInvoiceTable(doc, items) {
    doc.fontSize(11).font('Heading').fill('#66514a').moveDown(2.5).text('Description\nSession\nAmount Due', {
        width: 500,
        align: 'left',
        indent: 0,
        columns: 3,
        columnGap: 60,
        height: 20,
        ellipsis: true,
        lineGap: 10
    });

    if(items) {
        items.forEach(item => addLineItem(doc, item));
    }
}

function addLineItem(doc, item) {
    const itemText = `${item.name}\n${item.duration}\n$${item.amount}`
    doc
    .fontSize(11)
    .font('Regular')
    .fill('#887873')
    .moveDown()
    .text(itemText, {
        width: 500,
        align: 'left',
        indent: 0,
        columns: 3,
        columnGap: 60,
        height: 20,
        ellipsis: true,
    });
    if(item.discount) {
        doc.fontSize(8).moveDown(0.5).font('Heading').text(`-${item.discount}% DISCOUNT`);
    }
}

function addFooter(doc, total) {
    doc.rect(0, 580, 620, 265).fill('#6b5142');
    doc
        .fill('#fff')
        .font('Heading')
        .text("Payment via Bank Transfer", 55, 620)
        .lineGap(12)
        .moveDown()
        .font('Regular')
        .lineGap(8)
        .text("Name: Angela Germon\nBSB: 633-123\nAccount: 189894470");

    doc
        .font('Heading')
        .text("Total Amount Due", 420, 620)
        .moveDown()
        .fontSize(21)
        .text(`$${total}`)

    doc.fontSize(12).text("Thankyou", 55, 780)
    doc.fontSize(10).font('Regular').fill('#e2dbda').text("hello@angelajoshphotography.com.au | Angela & Josh Photography", 55, 783, {
        width: 480,
        align: 'right'
    })
}

function applyDiscount(item) {
    return Math.round((100 - item.discount) / 100 * item.amount)
}

function calculateTotal(items) {
    return Math.round(items.reduce((prev, current) => {
        if(current.discount) {
            return applyDiscount(current) + prev;
        }
        return current.amount + prev
    }, 0))
}