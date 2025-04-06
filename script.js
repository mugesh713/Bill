  // Function to convert number to words
  function numberToWords(num) {
    if (num === 0) return 'Zero';
    var a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    var b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(num) {
      if (num < 20) return a[num];
      if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "");
      if (num < 1000) return a[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " and " + inWords(num % 100) : "");
      if (num < 100000) return inWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + inWords(num % 1000) : "");
      if (num < 10000000) return inWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + inWords(num % 100000) : "");
      return inWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + inWords(num % 10000000) : "");
    }
    return inWords(num);
  }

  // Calculate Amount for a Row (Qty * Rate)
  function calculateRow(row) {
    const qtyInput = row.cells[4].querySelector('input');
    const rateInput = row.cells[5].querySelector('input');
    const amountInput = row.cells[6].querySelector('input');

    const qty = parseFloat(qtyInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const amount = qty * rate;

    amountInput.value = amount.toFixed(2);
    calculateTotals();
  }

  // Sum up all row amounts, calculate split GST, grand total, and update total in words
  function calculateTotals() {
    const table = document.getElementById("invoiceTable");
    let total = 0;
    for (let i = 1; i < table.rows.length; i++) {
      const row = table.rows[i];
      const amount = parseFloat(row.cells[6].querySelector('input').value) || 0;
      total += amount;
    }

    // Calculate split GST: CGST and SGST at 2.5% each
    const cgst = total * 0.025;
    const sgst = total * 0.025;

    // Round off (can be positive or negative)
    const roundOff = parseFloat(document.getElementById("roundOff").value) || 0;
    const grandTotal = total + cgst + sgst + roundOff;

    document.getElementById("totalAmount").value = total.toFixed(2);
    document.getElementById("cgstAmount").value = cgst.toFixed(2);
    document.getElementById("sgstAmount").value = sgst.toFixed(2);
    document.getElementById("grandTotal").value = grandTotal.toFixed(2);

    // Update total in words
    document.getElementById("amountInWords").value = numberToWords(grandTotal) + " Only";
  }

  // Add a new row with Remove button and input events
  // Function to add new row
 // Function to add new row
function addRow() {
  const tableBody = document.getElementById('tableBody');
  const newRow = tableBody.insertRow();

  newRow.innerHTML = `
    <td></td>
    <td><input type="text" oninput="calculateRow(this.parentElement.parentElement)" /></td>
    <td><input type="text" oninput="calculateRow(this.parentElement.parentElement)" /></td>
    <td><input type="text" oninput="calculateRow(this.parentElement.parentElement)" /></td>
    <td><input type="number" value="0" oninput="calculateRow(this.parentElement.parentElement)" /></td>
    <td><input type="number" value="0" oninput="calculateRow(this.parentElement.parentElement)" /></td>
    <td><input type="number" value="0" readonly /></td>
    <td><button onclick="removeRow(this)">Remove</button></td>
  `;

  updateSerialNumbers();
}

  function removeRow() {
    const table = document.getElementById('invoiceTable').getElementsByTagName('tbody')[0];
    if (table.rows.length > 1) {
      table.deleteRow(table.rows.length - 1);  // Remove last row
      updateSerialNumbers();
      calculateTotals();
    } else {
      alert("At least one row must remain.");
    }
  }

  function updateSerialNumbers() {
    const table = document.getElementById('invoiceTable').getElementsByTagName('tbody')[0];
    for (let i = 0; i < table.rows.length; i++) {
      table.rows[i].cells[0].innerText = i + 1;
    }
  }


  // Generate PDF invoice using jsPDF and autoTable
  function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text("SRIPRIYA TEX", 80, 10);
    doc.setFontSize(10);
    doc.text("3/121-A, Poothottam, Pallipalayam, Mangalam(Via)", 20, 18);
    doc.text("Poomalur(PO), Tiruppur (Dt) - 641663", 20, 24);
    doc.text("GSTIN: 33AFQPV2570M1ZR | Mobile: 8870620206", 20, 30);

    // Invoice and customer details
    const invoiceNo = document.getElementById("invoiceNo").value;
    const invoiceDate = document.getElementById("invoiceDate").value;
    const customerName = document.getElementById("customerName").value;
    const billingAddress = document.getElementById("billingAddress").value;
    const shippedToAddress = document.getElementById("shippedToAddress").value;
    const customerGST = document.getElementById("customerGST").value;

    doc.text(`Invoice No: ${invoiceNo}`, 20, 40);
    doc.text(`Invoice Date: ${invoiceDate}`, 120, 40);
    doc.text(`Customer: ${customerName}`, 20, 48);

    // Addresses in two columns
    doc.text("Billing Address:", 20, 56);
    doc.text(billingAddress, 20, 62, { maxWidth: 80 });
    doc.text("Shipped To Address:", 120, 56);
    doc.text(shippedToAddress, 120, 62, { maxWidth: 80 });

    doc.text(`GST No: ${customerGST}`, 20, 80);

    // Table Data
    const table = document.getElementById("goodsTable");
    const data = [];
    for (let i = 1; i < table.rows.length; i++) {
      const row = table.rows[i];
      data.push([
        row.cells[0].innerText,                                    // S.No
        row.cells[1].querySelector('input').value,                  // Package
        row.cells[2].querySelector('input').value,                  // Description
        row.cells[3].querySelector('input').value,                  // HSN Code
        row.cells[4].querySelector('input').value,                  // Qty
        row.cells[5].querySelector('input').value,                  // Rate
        row.cells[6].querySelector('input').value                   // Amount
      ]);
    }

    doc.autoTable({
      head: [['S.No', 'Package', 'Description', 'HSN Code', 'Qty', 'Rate', 'Amount']],
      body: data,
      startY: 92
    });

    // Totals and split GST
    const totalAmount = document.getElementById("totalAmount").value;
    const cgstAmount = document.getElementById("cgstAmount").value;
    const sgstAmount = document.getElementById("sgstAmount").value;
    const roundOff = document.getElementById("roundOff").value;
    const grandTotal = document.getElementById("grandTotal").value;
    const amountInWords = document.getElementById("amountInWords").value;

    let finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total: ₹${totalAmount}`, 150, finalY);
    doc.text(`CGST (2.5%): ₹${cgstAmount}`, 150, finalY + 6);
    doc.text(`SGST (2.5%): ₹${sgstAmount}`, 150, finalY + 12);
    doc.text(`Round Off: ₹${roundOff}`, 150, finalY + 18);
    doc.text(`Grand Total: ₹${grandTotal}`, 150, finalY + 24);
    doc.text(`Amount in Words: ${amountInWords}`, 20, finalY + 36);
    
      // Declaration and Last Authorized By (aligned right for signature)
      const declarationText = document.getElementById("declarationText").value;
      const authorizedBy = document.getElementById("authorizedBy").value;
      
      doc.text("Declaration / Goods Description:", 20, finalY + 46);
      doc.text(declarationText, 20, finalY + 52, { maxWidth: 170 });
      doc.text(`Last Authorized By: ${authorizedBy}`, 150, finalY + 68);
      
      doc.save(`Invoice_${invoiceNo || 'SRIPRIYA'}.pdf`);
    }
    