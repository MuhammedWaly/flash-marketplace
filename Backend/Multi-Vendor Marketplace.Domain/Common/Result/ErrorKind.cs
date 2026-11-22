using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Domain.Common.Result
{
    public enum ErrorKind
    {
        Failure,
        Unexpected,
        Validation,
        Conflict,
        NotFound,
        Unauthorized,
        Forbidden
    }
}
