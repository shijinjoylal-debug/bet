#include<iostream>
#include<type_traits>

int main(){
    int real_pass = 123;
    int pass;
    while(true){
        std::cout << "Enter your pass: ";
        std::cin >> pass;
          if(std::cin.fail()){
            std::cout << "Invalid input. Enter a number.\n";

            std::cin.clear();
            std::cin.ignore(1000, '\n');
            continue;
        }
        else if(pass == real_pass){
            std::cout << "Give the platfrom: ";
            break;
        }
        else{
            std::cout << "wrong pass\n";
            continue;
        }
    }
       return 0;
}
