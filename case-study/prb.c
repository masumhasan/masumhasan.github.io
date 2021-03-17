#include <stdio.h>
int main()
{
    long long t, x, n, d = 0, total, INT;
    scanf("%lld %lld %lld", &t, &x, &n);
    total = x;
    for (d = 1; d <= n; d++)
    {

        if (d > 1)
        {
            total = total + x;
        }
        if (d < n)
        {
            total = total * 2;
        }
        if (d % 7 == 0)
        {
            total = total / 2;
        }
        x++;
    }
    if (total >= t)
    {
        printf("YES\n");
    }
    else
        printf("NO\n");
    return 0;
}
