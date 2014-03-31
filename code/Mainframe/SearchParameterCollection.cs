using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mainframe
{
    public class SearchParameterCollection : IEnumerable<IEnumerable<SearchParameter>>
    {
        private List<IEnumerable<SearchParameter>> _searchParameters = new List<IEnumerable<SearchParameter>>();

        public SearchParameterCollection()
        { }

        public void Add(IEnumerable<SearchParameter> searchParameters)
        {
            if(searchParameters != null)
                this._searchParameters.Add(searchParameters);
        }

        public void Add(SearchParameterCollection searchParameters)
        {
            if (searchParameters != null)
                this._searchParameters.AddRange(searchParameters);
        }

        public IEnumerator<IEnumerable<SearchParameter>> GetEnumerator()
        {
            return this._searchParameters.GetEnumerator();
        }

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
        {
            return this._searchParameters.GetEnumerator();
        }
    }
}
