#include <stdio.h>

int main()
{
    int a, b, c, i;
    printf("Enter Lower Range : ");
    scanf("%d", &a);
    printf("Enter Upper Range : ");
    scanf("%d", &b);
    printf("The perfect numbers are : ");
    for (i = a; i <= b; i++)
    {
        int sum = 0;
        for (c = 1; c < i; c++)
        {
            if (i % c == 0)
            {
                sum += c;
            }
        }
        if (sum == i)
        {
            printf("%d ", i);
        }
    }
    return 0;
}