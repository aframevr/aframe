namespace AFrame.WinForms.TestApp
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.ClicksBtn = new System.Windows.Forms.Button();
            this.ClicksLbl = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // ClicksBtn
            // 
            this.ClicksBtn.Location = new System.Drawing.Point(12, 22);
            this.ClicksBtn.Name = "ClicksBtn";
            this.ClicksBtn.Size = new System.Drawing.Size(91, 23);
            this.ClicksBtn.TabIndex = 0;
            this.ClicksBtn.Text = "Update Clicks";
            this.ClicksBtn.UseVisualStyleBackColor = true;
            this.ClicksBtn.Click += new System.EventHandler(this.button1_Click);
            // 
            // ClicksLbl
            // 
            this.ClicksLbl.AutoSize = true;
            this.ClicksLbl.Location = new System.Drawing.Point(109, 27);
            this.ClicksLbl.Name = "ClicksLbl";
            this.ClicksLbl.Size = new System.Drawing.Size(13, 13);
            this.ClicksLbl.TabIndex = 1;
            this.ClicksLbl.Text = "0";
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(587, 354);
            this.Controls.Add(this.ClicksLbl);
            this.Controls.Add(this.ClicksBtn);
            this.Name = "Form1";
            this.Text = "Form1";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button ClicksBtn;
        private System.Windows.Forms.Label ClicksLbl;
    }
}

