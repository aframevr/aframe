using MainFrame.Web.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace MainFrame.Web.Tests.Features.SearchParameters
{
    [TestClass]
    public class SearchParamTests : BaseTest
    {
        [TestMethod]
        public void TestMethod1()
        {
            var searchParams = new SearchParameterCollection();
            searchParams.Add(new [] 
            { 
                new SearchParameter(name: WebControl.SearchProperties.JQuerySelector,
                                    value: "#always",
                                    searchOperator: SearchOperator.EqualTo)
            });

            var homePage = this.Context.NavigateTo(this.TestAppUrl);


        }
    }
}
