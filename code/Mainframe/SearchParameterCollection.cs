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

    //     internal PropertyExpressionCollection(List<PropertyCondition> list)
    //{
    //    Action<PropertyCondition> action = null;
    //    if (list != null)
    //    {
    //        if (action == null)
    //        {
    //            action = condition => this.Add(new PropertyExpression(condition));
    //        }
    //        list.ForEach(action);
    //    }
    //}

    //public void Add(PropertyExpression propertyExpression)
    //{
    //    if (propertyExpression == null)
    //    {
    //        throw new ArgumentNullException("propertyExpression");
    //    }
    //    this.Remove(propertyExpression.PropertyName);
    //    propertyExpression.PropertyChanged += new PropertyChangedEventHandler(this.OnPropertyChanged);
    //    base.List.Add(propertyExpression);
    //}

    //public void Add(params string[] nameValuePairs)
    //{
    //    if ((nameValuePairs.Length % 2) != 0)
    //    {
    //        throw new ArgumentException(ExtensionResources.OddNumberOfArguments, "nameValuePairs");
    //    }
    //    for (int i = 0; i < nameValuePairs.Length; i += 2)
    //    {
    //        this.Add(nameValuePairs[i], nameValuePairs[i + 1]);
    //    }
    //}




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
