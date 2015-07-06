using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AFrame.Core
{
    public class SearchPropertyCollection : IEnumerable<SearchProperty>
    {
        private List<SearchProperty> _searchProperties = new List<SearchProperty>();

        public SearchPropertyCollection()
        { }

        public SearchPropertyCollection(SearchProperty searchProperty)
        {
            this.Add(searchProperty);
        }

        public SearchPropertyCollection(IEnumerable<SearchProperty> searchProperties)
        {
            this.AddRange(searchProperties);
        }

        public void Add(SearchProperty searchProperty)
        {
            if (searchProperty != null)
                this._searchProperties.Add(searchProperty);
        }

        public void Add(params string[] nameValuePairs)
        {
            if ((nameValuePairs.Length % 2) != 0)
            {
                throw new ArgumentException("Odd number of arguments", "nameValuePairs");
            }
            for (int i = 0; i < nameValuePairs.Length; i = (int)(i + 2))
            {
                this.Add(nameValuePairs[i], nameValuePairs[i + 1]);
            }
        }

        public void Add(string name, string value)
        {
            this.Add(new SearchProperty(name, value, SearchOperator.EqualTo));
        }

        public void AddRange(IEnumerable<SearchProperty> searchProperties)
        {
            if (searchProperties != null)
                this._searchProperties.AddRange(searchProperties);
        }

        public IEnumerator<SearchProperty> GetEnumerator()
        {
            return this._searchProperties.GetEnumerator();
        }

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
        {
            return this._searchProperties.GetEnumerator();
        }
    }
}
