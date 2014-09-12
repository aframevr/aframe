using System;
using System.Globalization;

namespace AFrame.Core
{
    public class SearchProperty : ICloneable
    {
        public string Name { get; private set; }

        public string Value { get; private set; }

        public SearchOperator SearchOperator { get; private set; }

        public SearchProperty(string name, string value)
            : this(name, value, SearchOperator.EqualTo)
        { }

        public SearchProperty(string name, string value, SearchOperator searchOperator)
        {
            if (name == null)
                throw new ArgumentNullException("name");

            this.Name = name;
            this.Value = value;
            this.SearchOperator = searchOperator;
        }

        public object Clone()
        {
            return new SearchProperty(this.Name, this.Value, this.SearchOperator);
        }

        public override bool Equals(object other)
        {
            var expression = other as SearchProperty;
            if (expression == null)
                return false;

            return (((this.SearchOperator == expression.SearchOperator) && 
                      string.Equals(this.Name, expression.Name, StringComparison.OrdinalIgnoreCase)) && 
                      object.Equals(this.Value, expression.Value));
        }

        public override int GetHashCode()
        {
            int hashCode = this.SearchOperator.GetHashCode();
            if (this.Name != null)
            {
                hashCode ^= this.Name.GetHashCode();
            }
            if (this.Value != null)
            {
                hashCode ^= this.Value.GetHashCode();
            }
            return hashCode;
        }

        public override string ToString()
        {
            return string.Format(CultureInfo.InvariantCulture, "'{0}' {1} '{2}'", this.Name, this.SearchOperator, this.Value);
        }
    }
}